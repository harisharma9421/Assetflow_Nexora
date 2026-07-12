package com.assetflow.nexora.dto;

import java.time.*;

public record AssetAllocationResponse(Long id, Long assetId, String holderType, Long holderEmployeeId,
        Long holderDepartmentId, LocalDate allocationDate, LocalDate expectedReturnDate, LocalDate actualReturnDate,
        String status) {
}
