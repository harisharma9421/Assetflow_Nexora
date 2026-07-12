package com.assetflow.nexora.dto;

public record BookingHeatmapResponse(Long assetId, int dayOfWeek, int hourOfDay, long bookingCount) {
}
