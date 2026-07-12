package com.assetflow.nexora.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryCustomFieldRequest(
        @NotBlank @Size(max = 100) String fieldName,
        @NotBlank @Pattern(regexp = "Text|Number|Date|Boolean") String fieldType,
        boolean required) {
}
