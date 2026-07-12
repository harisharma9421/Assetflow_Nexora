package com.assetflow.nexora.dto; import java.time.*; public record AssetDocumentDto(Long id,Long assetId,String fileUrl,String fileType,Long uploadedBy,OffsetDateTime uploadedAt){}
