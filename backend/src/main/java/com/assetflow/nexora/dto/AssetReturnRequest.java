package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AssetReturnRequest(@NotNull Long returnedTo, LocalDate actualReturnDate, String conditionNotes,
        String assetCondition) {
}
