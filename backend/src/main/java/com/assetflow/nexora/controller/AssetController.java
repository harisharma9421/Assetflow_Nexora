package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.*;
import com.assetflow.nexora.service.AssetFileStorageService;
import com.assetflow.nexora.service.AssetService;
import com.assetflow.nexora.service.QrCodeService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/assets")
public class AssetController {
    private final AssetService assets;
    private final AssetFileStorageService storage;
    private final QrCodeService qrCodes;

    public AssetController(AssetService assets, AssetFileStorageService storage, QrCodeService qrCodes) {
        this.assets = assets;
        this.storage = storage;
        this.qrCodes = qrCodes;
    }

    @PostMapping
    public ResponseEntity<AssetDetailResponse> create(@Valid @RequestBody AssetCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assets.create(request));
    }

    @GetMapping
    public Page<AssetResponse> search(@RequestParam(required = false) String search,
            @RequestParam(required = false) String tag, @RequestParam(required = false) String serialNumber,
            @RequestParam(required = false) String qrCode, @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status, @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String location,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return assets.search(search, tag, serialNumber, qrCode, categoryId, status, departmentId, location, pageable);
    }

    @GetMapping("/{assetId}")
    public AssetDetailResponse get(@PathVariable Long assetId) {
        return assets.get(assetId);
    }

    @PutMapping("/{assetId}")
    public AssetDetailResponse update(@PathVariable Long assetId, @Valid @RequestBody AssetUpdateRequest request) {
        return assets.update(assetId, request);
    }

    @PatchMapping("/{assetId}/status")
    public AssetDetailResponse updateStatus(@PathVariable Long assetId,
            @Valid @RequestBody AssetStatusUpdateRequest request) {
        return assets.updateStatus(assetId, request);
    }

    @PostMapping(value = "/{assetId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssetDocumentResponse> upload(@PathVariable Long assetId, @RequestPart MultipartFile file,
            @RequestParam(required = false) String fileType, @RequestParam Long uploadedBy) {
        String url = storage.store(assetId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(assets.addDocument(assetId, url, fileType, uploadedBy));
    }

    @GetMapping("/{assetId}/history")
    public AssetHistoryResponse history(@PathVariable Long assetId) {
        return assets.history(assetId);
    }

    @GetMapping("/{assetId}/holder")
    public ResponseEntity<AssetAllocationResponse> getCurrentHolder(@PathVariable Long assetId) {
        return assets.getCurrentHolder(assetId).map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @GetMapping(value = "/{assetId}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public byte[] qr(@PathVariable Long assetId) {
        AssetDetailResponse asset = assets.get(assetId);
        return qrCodes.generate(asset.qrCode() == null ? asset.assetTag() : asset.qrCode());
    }
}
