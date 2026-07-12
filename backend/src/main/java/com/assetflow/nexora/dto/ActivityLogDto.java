package com.assetflow.nexora.dto;

import java.time.*;

public record ActivityLogDto(Long id, Long userId, String action, String entityType, Long entityId, String details,
        String ipAddress, OffsetDateTime createdAt) {
}
