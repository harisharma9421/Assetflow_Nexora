package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record TransferApproveRequest(
    @NotNull Long approvedBy,
    LocalDate expectedReturnDate,
    String notes
) {
}
