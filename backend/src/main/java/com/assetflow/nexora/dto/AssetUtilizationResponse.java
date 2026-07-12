package com.assetflow.nexora.dto;

public record AssetUtilizationResponse(Long assetId, String assetTag, String name, long timesAllocated,
        long totalDaysAllocated, long timesBooked) {
}
