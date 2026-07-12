package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DepartmentRequest(
        @NotBlank @Size(max = 150) String name,
        Long parentDepartmentId,
        Long headUserId,
        @Pattern(regexp = "Active|Inactive") String status) {
}
