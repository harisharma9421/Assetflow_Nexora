package com.assetflow.nexora.dto; import java.time.*; public record AuditCycleAuditorDto(Long auditCycleId,Long auditorUserId,OffsetDateTime assignedAt){}
