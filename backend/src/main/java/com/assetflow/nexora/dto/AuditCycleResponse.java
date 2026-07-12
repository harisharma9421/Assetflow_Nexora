package com.assetflow.nexora.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record AuditCycleResponse(Long id, String name, Long scopeDepartmentId, String scopeLocation,
        LocalDate startDate, LocalDate endDate, String status, Long createdBy, Long closedBy,
        OffsetDateTime closedAt, OffsetDateTime createdAt) {
}
