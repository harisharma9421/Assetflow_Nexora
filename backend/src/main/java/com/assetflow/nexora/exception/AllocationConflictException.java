package com.assetflow.nexora.exception;

import com.assetflow.nexora.dto.AssetAllocationResponse;

public class AllocationConflictException extends RuntimeException {
    private final AssetAllocationResponse currentHolder;

    public AllocationConflictException(String message, AssetAllocationResponse currentHolder) {
        super(message);
        this.currentHolder = currentHolder;
    }

    public AssetAllocationResponse getCurrentHolder() {
        return currentHolder;
    }
}
