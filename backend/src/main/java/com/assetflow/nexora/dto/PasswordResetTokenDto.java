package com.assetflow.nexora.dto; import java.time.*; public record PasswordResetTokenDto(Long id,Long userId,OffsetDateTime expiresAt,OffsetDateTime usedAt){}
