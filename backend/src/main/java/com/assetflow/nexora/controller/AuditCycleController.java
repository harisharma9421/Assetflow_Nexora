package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.AuditCycleCreateRequest;
import com.assetflow.nexora.dto.AuditCycleResponse;
import com.assetflow.nexora.service.AuditCycleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-cycles")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Audit", description = "Asset audit cycle management APIs")
public class AuditCycleController {
    private final AuditCycleService auditCycleService;

    public AuditCycleController(AuditCycleService auditCycleService) {
        this.auditCycleService = auditCycleService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Create audit cycle", description = "Create a new audit cycle with department or location scope")
    public ResponseEntity<AuditCycleResponse> createAuditCycle(
            @Valid @RequestBody AuditCycleCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        AuditCycleResponse response = auditCycleService.createAuditCycle(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "List audit cycles", description = "List all audit cycles with optional status filter")
    public ResponseEntity<List<AuditCycleResponse>> listAuditCycles(
            @RequestParam(required = false) String status) {
        List<AuditCycleResponse> response = auditCycleService.listAuditCycles(status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{auditCycleId}")
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Get audit cycle details", description = "Get detailed information about a specific audit cycle")
    public ResponseEntity<AuditCycleResponse> getAuditCycle(@PathVariable Long auditCycleId) {
        AuditCycleResponse response = auditCycleService.getAuditCycle(auditCycleId);
        return ResponseEntity.ok(response);
    }
}
