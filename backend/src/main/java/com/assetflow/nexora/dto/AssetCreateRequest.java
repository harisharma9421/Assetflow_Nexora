package com.assetflow.nexora.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public record AssetCreateRequest(String assetTag, @NotBlank @Size(max = 150) String name, @NotNull Long categoryId,
        @Size(max = 100) String serialNumber, @Size(max = 150) String qrCode, LocalDate acquisitionDate,
        @DecimalMin(value = "0.0") BigDecimal acquisitionCost, @NotBlank String condition,
        @Size(max = 150) String location, boolean bookable, Long owningDepartmentId, @NotNull Long createdBy,
        Map<Long, String> customFields) {
}
