package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.*;

public record AssetAllocationRequest(@NotNull Long assetId, @NotBlank String holderType, Long holderEmployeeId,
        Long holderDepartmentId, @NotNull Long allocatedBy, LocalDate expectedReturnDate) {
}
