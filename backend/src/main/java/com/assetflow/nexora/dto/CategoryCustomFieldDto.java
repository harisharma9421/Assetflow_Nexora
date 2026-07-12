package com.assetflow.nexora.dto;

public record CategoryCustomFieldDto(Long id, Long categoryId, String fieldName, String fieldType, boolean required) {
}
