package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotNull;

public record BookingCancelRequest(
    @NotNull Long cancelledBy,
    String reason
) {
}
