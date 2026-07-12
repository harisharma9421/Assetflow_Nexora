package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AuditCycleCreateRequest(
        @NotBlank(message = "Audit cycle name is required") String name,

        Long scopeDepartmentId,

        String scopeLocation,

        @NotNull(message = "Start date is required") LocalDate startDate,

        @NotNull(message = "End date is required") LocalDate endDate) {
}
