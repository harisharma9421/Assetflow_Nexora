package com.assetflow.nexora.dto;

import jakarta.validation.constraints.*;

public record AssetStatusUpdateRequest(@NotBlank String status, String reason, @NotNull Long changedBy) {
}
