package com.assetflow.nexora.dto;

import java.time.OffsetDateTime;

public record TransferRequestResponse(
    Long id,
    Long assetId,
    Long currentAllocationId,
    Long requestedBy,
    Long requestedToEmployeeId,
    Long requestedToDepartmentId,
    String reason,
    String status,
    Long approvedBy,
    Long newAllocationId,
    OffsetDateTime requestedAt,
    OffsetDateTime resolvedAt
) {
}
