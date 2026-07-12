package com.assetflow.nexora.dto;

import java.time.*;

public record ResourceBookingResponse(Long id, Long assetId, Long bookedBy, Long departmentId, String purpose,
        OffsetDateTime startTime, OffsetDateTime endTime, String status) {
}
