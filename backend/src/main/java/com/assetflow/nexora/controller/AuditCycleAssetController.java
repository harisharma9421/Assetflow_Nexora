package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.AuditCycleAssetResponse;
import com.assetflow.nexora.dto.AuditCycleAssetVerifyRequest;
import com.assetflow.nexora.service.AuditCycleAssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-cycle-assets")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Audit", description = "Audit cycle asset verification APIs")
public class AuditCycleAssetController {
    private final AuditCycleAssetService auditCycleAssetService;

    public AuditCycleAssetController(AuditCycleAssetService auditCycleAssetService) {
        this.auditCycleAssetService = auditCycleAssetService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "List audit cycle assets", description = "List all assets in an audit cycle")
    public ResponseEntity<List<AuditCycleAssetResponse>> listAuditCycleAssets(
            @RequestParam Long auditCycleId) {
        List<AuditCycleAssetResponse> response = auditCycleAssetService.listAuditCycleAssets(auditCycleId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{auditCycleAssetId}/verify")
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Verify audit asset", description = "Mark an asset as Verified, Missing, or Damaged during audit")
    public ResponseEntity<AuditCycleAssetResponse> verifyAsset(@PathVariable Long auditCycleAssetId,
            @Valid @RequestBody AuditCycleAssetVerifyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        AuditCycleAssetResponse response = auditCycleAssetService.verifyAsset(auditCycleAssetId,
                request.verificationStatus(), request.notes(), userId);
        return ResponseEntity.ok(response);
    }
}
