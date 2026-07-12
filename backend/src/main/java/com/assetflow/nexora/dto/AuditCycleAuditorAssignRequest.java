package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotNull;

public record AuditCycleAuditorAssignRequest(@NotNull(message = "Auditor user ID is required") Long auditorUserId) {
}
