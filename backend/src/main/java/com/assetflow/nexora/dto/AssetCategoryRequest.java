package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AssetCategoryRequest(
        @NotBlank @Size(max = 100) String name,
        String description,
        @Pattern(regexp = "Active|Inactive") String status) {
}
