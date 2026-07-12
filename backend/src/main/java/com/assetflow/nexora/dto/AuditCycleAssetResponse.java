package com.assetflow.nexora.dto;

import java.time.OffsetDateTime;

public record AuditCycleAssetResponse(Long id, Long auditCycleId, Long assetId, String verificationStatus,
        Long verifiedBy, OffsetDateTime verifiedAt, String notes) {
}
