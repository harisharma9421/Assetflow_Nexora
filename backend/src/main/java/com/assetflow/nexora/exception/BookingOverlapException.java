package com.assetflow.nexora.exception;

import java.time.OffsetDateTime;

public class BookingOverlapException extends RuntimeException {
    private final OffsetDateTime conflictStart;
    private final OffsetDateTime conflictEnd;

    public BookingOverlapException(String message, OffsetDateTime conflictStart, OffsetDateTime conflictEnd) {
        super(message);
        this.conflictStart = conflictStart;
        this.conflictEnd = conflictEnd;
    }

    public OffsetDateTime getConflictStart() {
        return conflictStart;
    }

    public OffsetDateTime getConflictEnd() {
        return conflictEnd;
    }
}
