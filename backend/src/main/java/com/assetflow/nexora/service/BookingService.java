package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.BookingCancelRequest;
import com.assetflow.nexora.dto.BookingRescheduleRequest;
import com.assetflow.nexora.dto.ResourceBookingRequest;
import com.assetflow.nexora.dto.ResourceBookingResponse;
import com.assetflow.nexora.entity.Asset;
import com.assetflow.nexora.entity.ResourceBooking;
import com.assetflow.nexora.entity.User;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.BookingOverlapException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.exception.UnauthorizedException;
import com.assetflow.nexora.repository.AssetRepository;
import com.assetflow.nexora.repository.ResourceBookingRepository;
import com.assetflow.nexora.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookingService {
    private final ResourceBookingRepository bookings;
    private final AssetRepository assets;
    private final UserRepository users;
    private final ActivityLogService activityLogService;

    public BookingService(ResourceBookingRepository bookings, AssetRepository assets, UserRepository users,
            ActivityLogService activityLogService) {
        this.bookings = bookings;
        this.assets = assets;
        this.users = users;
        this.activityLogService = activityLogService;
    }

    public ResourceBookingResponse createBooking(ResourceBookingRequest request, Long bookedBy) {
        // Validate asset exists and is bookable
        Asset asset = assets.findById(request.assetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset with id " + request.assetId() + " was not found"));
        
        if (!asset.bookable) {
            throw new BadRequestException("Asset is not bookable");
        }
        
        // Validate user exists
        User user = users.findById(bookedBy)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + bookedBy + " was not found"));
        
        // Validate time range
        if (request.startTime() == null || request.endTime() == null) {
            throw new BadRequestException("Start time and end time are required");
        }
        
        if (!request.endTime().isAfter(request.startTime())) {
            throw new BadRequestException("End time must be after start time");
        }
        
        // Validate booking is not in the past
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (request.startTime().isBefore(now)) {
            throw new BadRequestException("Cannot create booking in the past");
        }
        
        // Create booking - let database handle overlap constraint
        ResourceBooking booking = new ResourceBooking();
        booking.assetId = request.assetId();
        booking.bookedBy = bookedBy;
        booking.departmentId = request.departmentId();
        booking.purpose = request.purpose();
        booking.startTime = request.startTime();
        booking.endTime = request.endTime();
        booking.status = "Upcoming";
        
        try {
            ResourceBooking saved = bookings.save(booking);
            
            // Log activity
            activityLogService.log(
                "BOOKING_CREATED",
                "booking",
                saved.id,
                bookedBy,
                Map.of(
                    "assetId", request.assetId(),
                    "startTime", request.startTime().toString(),
                    "endTime", request.endTime().toString(),
                    "purpose", request.purpose() != null ? request.purpose() : "",
                    "departmentId", request.departmentId() != null ? request.departmentId() : 0
                )
            );
            
            return toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            // Check if it's an overlap constraint violation
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("excl_no_overlapping_bookings")) {
                // Find the overlapping booking to provide details
                List<ResourceBooking> existingBookings = bookings.findByAssetId(request.assetId());
                for (ResourceBooking existing : existingBookings) {
                    if (("Upcoming".equals(existing.status) || "Ongoing".equals(existing.status)) &&
                        isOverlapping(request.startTime(), request.endTime(), existing.startTime, existing.endTime)) {
                        throw new BookingOverlapException(
                            String.format("Time slot %s to %s overlaps with an existing booking from %s to %s",
                                request.startTime(), request.endTime(), existing.startTime, existing.endTime),
                            existing.startTime,
                            existing.endTime
                        );
                    }
                }
                throw new BookingOverlapException(
                    "Booking time slot overlaps with an existing booking. Please choose a different time.",
                    request.startTime(),
                    request.endTime()
                );
            }
            throw e;
        }
    }

    private boolean isOverlapping(OffsetDateTime start1, OffsetDateTime end1, 
                                   OffsetDateTime start2, OffsetDateTime end2) {
        // Ranges overlap if: start1 < end2 AND end1 > start2
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    @Transactional(readOnly = true)
    public List<ResourceBookingResponse> listBookings(String status, Long bookedBy, Long assetId, Long requestingUserId) {
        // Get user to check their role
        User requestingUser = users.findById(requestingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + requestingUserId + " was not found"));
        
        // Admin (1) and Asset Manager (2) can see all bookings
        boolean isAdminOrManager = requestingUser.roleId == 1 || requestingUser.roleId == 2;
        
        List<ResourceBooking> result;
        
        if (assetId != null) {
            result = bookings.findByAssetId(assetId);
        } else if (bookedBy != null) {
            result = bookings.findByBookedBy(bookedBy);
        } else {
            result = bookings.findAll();
        }
        
        // Filter by status if provided
        if (status != null && !status.isBlank()) {
            String finalStatus = status;
            result = result.stream()
                    .filter(b -> finalStatus.equals(b.status))
                    .toList();
        }
        
        // AUTHORIZATION: Regular users can only see their own bookings
        if (!isAdminOrManager) {
            Long finalUserId = requestingUserId;
            result = result.stream()
                    .filter(b -> finalUserId.equals(b.bookedBy))
                    .toList();
        }
        
        return result.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResourceBookingResponse getBooking(Long bookingId, Long requestingUserId) {
        ResourceBooking booking = findBooking(bookingId);
        
        // AUTHORIZATION: Check if user can access this booking
        validateBookingAccess(booking, requestingUserId, "view");
        
        return toResponse(booking);
    }

    public ResourceBookingResponse cancelBooking(Long bookingId, Long cancelledBy, String reason) {
        ResourceBooking booking = findBooking(bookingId);
        
        // AUTHORIZATION: Check if user can cancel this booking
        validateBookingAccess(booking, cancelledBy, "cancel");
        
        // Validate booking is not already cancelled or completed
        if ("Cancelled".equals(booking.status)) {
            throw new BadRequestException("Booking is already cancelled");
        }
        
        if ("Completed".equals(booking.status)) {
            throw new BadRequestException("Cannot cancel a completed booking");
        }
        
        // Validate user exists
        users.findById(cancelledBy)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + cancelledBy + " was not found"));
        
        // Cancel the booking
        booking.status = "Cancelled";
        booking.cancelledBy = cancelledBy;
        booking.cancelledAt = OffsetDateTime.now(ZoneOffset.UTC);
        
        ResourceBooking saved = bookings.save(booking);
        
        // Log activity
        activityLogService.log(
            "BOOKING_CANCELLED",
            "booking",
            saved.id,
            cancelledBy,
            Map.of(
                "assetId", booking.assetId,
                "reason", reason != null ? reason : "",
                "originalStartTime", booking.startTime.toString(),
                "originalEndTime", booking.endTime.toString()
            )
        );
        
        return toResponse(saved);
    }

    public ResourceBookingResponse rescheduleBooking(Long bookingId, BookingRescheduleRequest request, Long requestingUserId) {
        ResourceBooking booking = findBooking(bookingId);
        
        // AUTHORIZATION: Check if user can reschedule this booking
        validateBookingAccess(booking, requestingUserId, "reschedule");
        
        // Validate booking can be rescheduled
        if ("Cancelled".equals(booking.status)) {
            throw new BadRequestException("Cannot reschedule a cancelled booking");
        }
        
        if ("Completed".equals(booking.status)) {
            throw new BadRequestException("Cannot reschedule a completed booking");
        }
        
        // Validate new time range
        if (request.startTime() == null || request.endTime() == null) {
            throw new BadRequestException("Start time and end time are required");
        }
        
        if (!request.endTime().isAfter(request.startTime())) {
            throw new BadRequestException("End time must be after start time");
        }
        
        // Validate new booking is not in the past
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (request.startTime().isBefore(now)) {
            throw new BadRequestException("Cannot reschedule booking to the past");
        }
        
        // Store old times for potential rollback
        OffsetDateTime oldStart = booking.startTime;
        OffsetDateTime oldEnd = booking.endTime;
        
        try {
            // Update booking times
            booking.startTime = request.startTime();
            booking.endTime = request.endTime();
            
            // Database constraint will check for overlaps with other bookings
            ResourceBooking saved = bookings.save(booking);
            
            // Log activity
            activityLogService.log(
                "BOOKING_RESCHEDULED",
                "booking",
                saved.id,
                requestingUserId,
                Map.of(
                    "assetId", booking.assetId,
                    "oldStartTime", oldStart.toString(),
                    "oldEndTime", oldEnd.toString(),
                    "newStartTime", request.startTime().toString(),
                    "newEndTime", request.endTime().toString()
                )
            );
            
            return toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            // Check if it's an overlap constraint violation
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("excl_no_overlapping_bookings")) {
                // Find the overlapping booking to provide details
                List<ResourceBooking> existingBookings = bookings.findByAssetId(booking.assetId);
                for (ResourceBooking existing : existingBookings) {
                    if (!existing.id.equals(bookingId) && 
                        ("Upcoming".equals(existing.status) || "Ongoing".equals(existing.status)) &&
                        isOverlapping(request.startTime(), request.endTime(), existing.startTime, existing.endTime)) {
                        throw new BookingOverlapException(
                            String.format("Rescheduled time slot %s to %s overlaps with an existing booking from %s to %s",
                                request.startTime(), request.endTime(), existing.startTime, existing.endTime),
                            existing.startTime,
                            existing.endTime
                        );
                    }
                }
                throw new BookingOverlapException(
                    "Rescheduled booking time slot overlaps with an existing booking. Please choose a different time.",
                    request.startTime(),
                    request.endTime()
                );
            }
            throw e;
        }
    }

    public ResourceBookingResponse startBooking(Long bookingId, Long requestingUserId) {
        ResourceBooking booking = findBooking(bookingId);
        
        // AUTHORIZATION: Check if user can start this booking
        validateBookingAccess(booking, requestingUserId, "start");
        
        if (!"Upcoming".equals(booking.status)) {
            throw new BadRequestException("Only upcoming bookings can be started");
        }
        
        booking.status = "Ongoing";
        ResourceBooking saved = bookings.save(booking);
        
        // Log activity
        activityLogService.log(
            "BOOKING_STARTED",
            "booking",
            saved.id,
            requestingUserId,
            Map.of(
                "assetId", booking.assetId,
                "startTime", booking.startTime.toString(),
                "endTime", booking.endTime.toString()
            )
        );
        
        return toResponse(saved);
    }

    public ResourceBookingResponse completeBooking(Long bookingId, Long requestingUserId) {
        ResourceBooking booking = findBooking(bookingId);
        
        // AUTHORIZATION: Check if user can complete this booking
        validateBookingAccess(booking, requestingUserId, "complete");
        
        if (!"Ongoing".equals(booking.status) && !"Upcoming".equals(booking.status)) {
            throw new BadRequestException("Only ongoing or upcoming bookings can be completed");
        }
        
        booking.status = "Completed";
        ResourceBooking saved = bookings.save(booking);
        
        // Log activity
        activityLogService.log(
            "BOOKING_COMPLETED",
            "booking",
            saved.id,
            requestingUserId,
            Map.of(
                "assetId", booking.assetId,
                "startTime", booking.startTime.toString(),
                "endTime", booking.endTime.toString()
            )
        );
        
        return toResponse(saved);
    }
    
    /**
     * Validates if a user has permission to access/modify a booking.
     * ADMIN and ASSET_MANAGER can access all bookings.
     * Regular users can only access their own bookings.
     */
    private void validateBookingAccess(ResourceBooking booking, Long requestingUserId, String action) {
        User requestingUser = users.findById(requestingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + requestingUserId + " was not found"));
        
        // Role IDs: 1=Admin, 2=Asset Manager, 3=Department Head, 4=Employee
        boolean isAdminOrManager = requestingUser.roleId == 1 || requestingUser.roleId == 2;
        
        // ADMIN and ASSET_MANAGER can access any booking
        if (isAdminOrManager) {
            return;
        }
        
        // Regular users can only access their own bookings
        if (!booking.bookedBy.equals(requestingUserId)) {
            throw new UnauthorizedException(
                String.format("You do not have permission to %s this booking. You can only %s your own bookings.", 
                    action, action)
            );
        }
    }

    private ResourceBooking findBooking(Long id) {
        return bookings.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking with id " + id + " was not found"));
    }

    private ResourceBookingResponse toResponse(ResourceBooking b) {
        return new ResourceBookingResponse(
            b.id,
            b.assetId,
            b.bookedBy,
            b.departmentId,
            b.purpose,
            b.startTime,
            b.endTime,
            b.status
        );
    }
}
