package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.*;
import com.assetflow.nexora.service.TransferService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {
    private final TransferService transfers;

    public TransferController(TransferService transfers) {
        this.transfers = transfers;
    }

    @PostMapping
    public ResponseEntity<TransferRequestResponse> create(@Valid @RequestBody TransferRequestCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transfers.create(request));
    }

    @GetMapping
    public List<TransferRequestResponse> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assetId) {
        return transfers.list(status, assetId);
    }

    @GetMapping("/{transferId}")
    public TransferRequestResponse get(@PathVariable Long transferId) {
        return transfers.get(transferId);
    }

    @PostMapping("/{transferId}/approve")
    public TransferRequestResponse approve(
            @PathVariable Long transferId,
            @Valid @RequestBody TransferApproveRequest request) {
        return transfers.approve(transferId, request);
    }

    @PostMapping("/{transferId}/reject")
    public TransferRequestResponse reject(
            @PathVariable Long transferId,
            @Valid @RequestBody TransferRejectRequest request) {
        return transfers.reject(transferId, request);
    }
}
