package com.assetflow.nexora.dto;

import java.time.OffsetDateTime;

public record AssetDocumentResponse(Long id, String fileUrl, String fileType, Long uploadedBy,
        OffsetDateTime uploadedAt) {
}
