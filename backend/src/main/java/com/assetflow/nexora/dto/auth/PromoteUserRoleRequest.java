package com.assetflow.nexora.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record PromoteUserRoleRequest(@NotBlank String roleName) {
}
