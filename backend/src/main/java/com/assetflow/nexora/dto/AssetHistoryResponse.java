package com.assetflow.nexora.dto;

import java.util.List;

public record AssetHistoryResponse(List<AssetStatusHistoryDto> lifecycle, List<AssetAllocationResponse> allocations,
        List<MaintenanceRequestDto> maintenance, List<AssetDocumentResponse> documents) {
}
