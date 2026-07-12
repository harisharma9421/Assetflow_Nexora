package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotNull;

public record TransferRequestCreateRequest(
    @NotNull Long assetId,
    @NotNull Long currentAllocationId,
    @NotNull Long requestedBy,
    Long requestedToEmployeeId,
    Long requestedToDepartmentId,
    String reason
) {
}
