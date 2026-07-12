package com.assetflow.nexora.dto;

import java.time.*;

public record AssetAllocationRequest(Long assetId, String holderType, Long holderEmployeeId, Long holderDepartmentId,
        LocalDate expectedReturnDate) {
}
