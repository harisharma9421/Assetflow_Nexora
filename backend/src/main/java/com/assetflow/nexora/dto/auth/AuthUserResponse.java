package com.assetflow.nexora.dto.auth;

public record AuthUserResponse(
        Long id,
        String fullName,
        String email,
        Long departmentId,
        Short roleId,
        String roleName,
        String status) {
}
