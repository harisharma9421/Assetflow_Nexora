package com.assetflow.nexora.dto;

public record TransferRequestDto(Long id, Long assetId, Long currentAllocationId, Long requestedToEmployeeId,
        Long requestedToDepartmentId, String reason, String status) {
}
