package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MaintenanceRequestCreateRequest(
        @NotNull(message = "Asset ID is required") Long assetId,

        @NotBlank(message = "Issue description is required") String issueDescription,

        @NotBlank(message = "Priority is required") String priority) {
}
