package com.assetflow.nexora.dto;

import java.time.LocalDate;

public record OverdueReturnResponse(Long allocationId, Long assetId, String assetTag, String assetName,
        Long holderEmployeeId, Long holderDepartmentId, LocalDate expectedReturnDate, int daysOverdue) {
}
