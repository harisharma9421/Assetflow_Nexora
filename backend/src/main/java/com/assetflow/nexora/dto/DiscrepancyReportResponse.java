package com.assetflow.nexora.dto;

import java.time.OffsetDateTime;

public record DiscrepancyReportResponse(Long id, Long auditCycleId, Long assetId, String issueType,
        String description, String resolutionStatus, Long resolvedBy, OffsetDateTime resolvedAt,
        OffsetDateTime createdAt) {
}
