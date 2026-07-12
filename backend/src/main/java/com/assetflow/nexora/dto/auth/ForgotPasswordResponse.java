package com.assetflow.nexora.dto.auth;

import java.time.OffsetDateTime;

public record ForgotPasswordResponse(
        String message,
        OffsetDateTime expiresAt) {
}
