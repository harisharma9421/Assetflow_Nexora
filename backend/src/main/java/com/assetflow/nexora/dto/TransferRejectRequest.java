package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TransferRejectRequest(
    @NotNull Long rejectedBy,
    @NotBlank String reason
) {
}
