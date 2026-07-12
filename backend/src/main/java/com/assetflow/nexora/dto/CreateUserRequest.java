package com.assetflow.nexora.dto;

public record CreateUserRequest(String fullName, String email, String password, Long departmentId, Short roleId) {
}
