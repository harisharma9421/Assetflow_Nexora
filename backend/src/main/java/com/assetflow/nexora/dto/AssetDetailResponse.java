package com.assetflow.nexora.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AssetDetailResponse(Long id, String assetTag, String name, Long categoryId, String serialNumber,
        String qrCode, LocalDate acquisitionDate, BigDecimal acquisitionCost, String condition, String location,
        String status, boolean bookable, Long owningDepartmentId, List<AssetCustomFieldValueDto> customFields,
        List<AssetDocumentResponse> documents, List<AssetAllocationResponse> allocations,
        List<MaintenanceRequestDto> maintenance) {
}
