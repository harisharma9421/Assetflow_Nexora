package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotNull;
import java.time.*;

public record ResourceBookingRequest(
    @NotNull Long assetId, 
    Long departmentId, 
    String purpose, 
    @NotNull OffsetDateTime startTime,
    @NotNull OffsetDateTime endTime
) {
}
