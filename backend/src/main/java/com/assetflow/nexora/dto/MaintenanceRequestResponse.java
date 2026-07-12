package com.assetflow.nexora.dto;

import java.time.OffsetDateTime;

public record MaintenanceRequestResponse(Long id, Long assetId, Long raisedBy, String issueDescription,
        String priority, String status, Long approvedBy, OffsetDateTime approvedAt, String rejectionReason,
        String technicianName, OffsetDateTime technicianAssignedAt, OffsetDateTime resolvedAt,
        String resolutionNotes, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
}
