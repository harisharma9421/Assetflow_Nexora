package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.ResourceBookingRequest;
import com.assetflow.nexora.dto.ResourceBookingResponse;
import com.assetflow.nexora.entity.Asset;
import com.assetflow.nexora.entity.ResourceBooking;
import com.assetflow.nexora.entity.User;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.BookingOverlapException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.AssetRepository;
import com.assetflow.nexora.repository.ResourceBookingRepository;
import com.assetflow.nexora.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookingService {
    private final ResourceBookingRepository bookings;
    private final AssetRepository assets;
    private final UserRepository users;

    public BookingService(ResourceBookingRepository bookings, AssetRepository assets, UserRepository users) {
        this.bookings = bookings;
        this.assets = assets;
        this.users = users;
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
    public List<ResourceBookingResponse> listBookings(String status, Long bookedBy, Long assetId) {
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
        
        return result.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResourceBookingResponse getBooking(Long bookingId) {
        ResourceBooking booking = findBooking(bookingId);
        return toResponse(booking);
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
