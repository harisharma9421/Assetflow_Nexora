package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotBlank;

public record AuditCycleAssetVerifyRequest(
        @NotBlank(message = "Verification status is required") String verificationStatus,

        String notes) {
}
