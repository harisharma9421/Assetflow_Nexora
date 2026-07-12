package com.assetflow.nexora.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @NotBlank @Size(max = 150) String fullName,
        @Email @Size(max = 150) String email,
        Long departmentId,
        Short roleId,
        @Pattern(regexp = "Active|Inactive") String status) {
}
