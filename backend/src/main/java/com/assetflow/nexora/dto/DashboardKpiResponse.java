package com.assetflow.nexora.dto;

public record DashboardKpiResponse(long assetsAvailable, long assetsAllocated, long maintenanceToday,
        long activeBookings, long pendingTransfers, long upcomingReturns) {
}
