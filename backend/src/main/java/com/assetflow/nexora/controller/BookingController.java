package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.BookingCancelRequest;
import com.assetflow.nexora.dto.BookingRescheduleRequest;
import com.assetflow.nexora.dto.ResourceBookingRequest;
import com.assetflow.nexora.dto.ResourceBookingResponse;
import com.assetflow.nexora.service.BookingService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ResourceBookingResponse> createBooking(
            @Valid @RequestBody ResourceBookingRequest request,
            @RequestParam Long bookedBy) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request, bookedBy));
    }

    @GetMapping
    public List<ResourceBookingResponse> listBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long bookedBy,
            @RequestParam(required = false) Long assetId) {
        return bookingService.listBookings(status, bookedBy, assetId);
    }

    @GetMapping("/{bookingId}")
    public ResourceBookingResponse getBooking(@PathVariable Long bookingId) {
        return bookingService.getBooking(bookingId);
    }

    @PostMapping("/{bookingId}/cancel")
    public ResourceBookingResponse cancelBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingCancelRequest request) {
        return bookingService.cancelBooking(bookingId, request);
    }

    @PutMapping("/{bookingId}/reschedule")
    public ResourceBookingResponse rescheduleBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingRescheduleRequest request) {
        return bookingService.rescheduleBooking(bookingId, request);
    }

    @PostMapping("/{bookingId}/start")
    public ResourceBookingResponse startBooking(@PathVariable Long bookingId) {
        return bookingService.startBooking(bookingId);
    }

    @PostMapping("/{bookingId}/complete")
    public ResourceBookingResponse completeBooking(@PathVariable Long bookingId) {
        return bookingService.completeBooking(bookingId);
    }
}
