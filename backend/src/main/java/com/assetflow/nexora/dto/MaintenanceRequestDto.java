package com.assetflow.nexora.dto;

public record MaintenanceRequestDto(Long id, Long assetId, String issueDescription, String priority, String status,
        String technicianName, String resolutionNotes) {
}
