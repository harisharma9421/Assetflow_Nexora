package com.assetflow.nexora.dto;

import java.time.OffsetDateTime;

public record ActivityLogResponse(Long id, Long userId, String actorName, String action, String entityType,
        Long entityId, String details, String ipAddress, OffsetDateTime createdAt) {
}
