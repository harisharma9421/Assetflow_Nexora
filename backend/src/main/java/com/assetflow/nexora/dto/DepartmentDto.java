package com.assetflow.nexora.dto;

public record DepartmentDto(Long id, String name, Long parentDepartmentId, Long headUserId, String status) {
}
