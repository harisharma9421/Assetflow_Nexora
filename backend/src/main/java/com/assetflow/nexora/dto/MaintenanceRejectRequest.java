package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotBlank;

public record MaintenanceRejectRequest(
        @NotBlank(message = "Rejection reason is required") String rejectionReason) {
}
