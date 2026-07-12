package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record BookingRescheduleRequest(
    @NotNull OffsetDateTime startTime,
    @NotNull OffsetDateTime endTime
) {
}
