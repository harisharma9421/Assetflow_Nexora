package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.BookingCancelRequest;
import com.assetflow.nexora.dto.BookingRescheduleRequest;
import com.assetflow.nexora.dto.ResourceBookingRequest;
import com.assetflow.nexora.dto.ResourceBookingResponse;
import com.assetflow.nexora.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Bookings", description = "Resource booking management APIs")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Create booking", description = "Create a new resource booking for the authenticated user")
    public ResponseEntity<ResourceBookingResponse> createBooking(
            @Valid @RequestBody ResourceBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request, userId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "List bookings", description = "List all bookings with optional filters")
    public List<ResourceBookingResponse> listBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long bookedBy,
            @RequestParam(required = false) Long assetId) {
        return bookingService.listBookings(status, bookedBy, assetId);
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Get booking details", description = "Get detailed information about a specific booking")
    public ResourceBookingResponse getBooking(@PathVariable Long bookingId) {
        return bookingService.getBooking(bookingId);
    }

    @PostMapping("/{bookingId}/cancel")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Cancel booking", description = "Cancel a booking")
    public ResourceBookingResponse cancelBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingCancelRequest request) {
        return bookingService.cancelBooking(bookingId, request);
    }

    @PutMapping("/{bookingId}/reschedule")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Reschedule booking", description = "Change the time slot of a booking")
    public ResourceBookingResponse rescheduleBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingRescheduleRequest request) {
        return bookingService.rescheduleBooking(bookingId, request);
    }

    @PostMapping("/{bookingId}/start")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Start booking", description = "Mark a booking as ongoing")
    public ResourceBookingResponse startBooking(@PathVariable Long bookingId) {
        return bookingService.startBooking(bookingId);
    }

    @PostMapping("/{bookingId}/complete")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Complete booking", description = "Mark a booking as completed")
    public ResourceBookingResponse completeBooking(@PathVariable Long bookingId) {
        return bookingService.completeBooking(bookingId);
    }
}
