package com.assetflow.nexora.dto;

public record DiscrepancyReportDto(Long id, Long auditCycleId, Long assetId, String issueType, String description,
        String resolutionStatus) {
}
