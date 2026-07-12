package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotBlank;

public record MaintenanceTechnicianAssignRequest(
        @NotBlank(message = "Technician name is required") String technicianName) {
}
