package com.assetflow.nexora.dto;

public record AssetResponse(Long id, String assetTag, String name, Long categoryId, String serialNumber, String qrCode,
        String condition, String location, String status, boolean bookable, Long owningDepartmentId) {
}
