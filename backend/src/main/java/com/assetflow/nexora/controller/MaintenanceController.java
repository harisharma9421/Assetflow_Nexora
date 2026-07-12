package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.MaintenanceAttachmentDto;
import com.assetflow.nexora.dto.MaintenanceApproveRequest;
import com.assetflow.nexora.dto.MaintenanceRejectRequest;
import com.assetflow.nexora.dto.MaintenanceRequestCreateRequest;
import com.assetflow.nexora.dto.MaintenanceRequestResponse;
import com.assetflow.nexora.dto.MaintenanceResolveRequest;
import com.assetflow.nexora.dto.MaintenanceTechnicianAssignRequest;
import com.assetflow.nexora.service.MaintenanceService;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/maintenance-requests")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Maintenance", description = "Maintenance request lifecycle APIs")
public class MaintenanceController {
    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Create maintenance request", description = "Employee raises a maintenance request for an asset")
    public ResponseEntity<MaintenanceRequestResponse> createMaintenanceRequest(
            @Valid @RequestBody MaintenanceRequestCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        MaintenanceRequestResponse response = maintenanceService.createMaintenanceRequest(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "List maintenance requests", description = "List all maintenance requests with optional filters")
    public ResponseEntity<List<MaintenanceRequestResponse>> listMaintenanceRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assetId) {
        List<MaintenanceRequestResponse> response = maintenanceService.listMaintenanceRequests(status, assetId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Get maintenance request details", description = "Get detailed information about a specific maintenance request")
    public ResponseEntity<MaintenanceRequestResponse> getMaintenanceRequest(
            @PathVariable Long requestId) {
        MaintenanceRequestResponse response = maintenanceService.getMaintenanceRequest(requestId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{requestId}/attachments")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Upload maintenance attachment", description = "Upload a photo or document for a maintenance request")
    public ResponseEntity<MaintenanceAttachmentDto> uploadAttachment(@PathVariable Long requestId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        MaintenanceAttachmentDto response = maintenanceService.uploadAttachment(requestId, file, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{requestId}/attachments")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "List maintenance attachments", description = "List all attachments for a maintenance request")
    public ResponseEntity<List<MaintenanceAttachmentDto>> listAttachments(@PathVariable Long requestId) {
        List<MaintenanceAttachmentDto> response = maintenanceService.listAttachments(requestId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Approve maintenance request", description = "Asset Manager approves a maintenance request and sets asset to Under Maintenance")
    public ResponseEntity<MaintenanceRequestResponse> approveMaintenance(@PathVariable Long requestId,
            @Valid @RequestBody MaintenanceApproveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        MaintenanceRequestResponse response = maintenanceService.approveMaintenance(requestId, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Reject maintenance request", description = "Asset Manager rejects a maintenance request with a reason")
    public ResponseEntity<MaintenanceRequestResponse> rejectMaintenance(@PathVariable Long requestId,
            @Valid @RequestBody MaintenanceRejectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        MaintenanceRequestResponse response = maintenanceService.rejectMaintenance(requestId,
                request.rejectionReason(), userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{requestId}/assign-technician")
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Assign technician to maintenance", description = "Assign a technician to an approved maintenance request")
    public ResponseEntity<MaintenanceRequestResponse> assignTechnician(@PathVariable Long requestId,
            @Valid @RequestBody MaintenanceTechnicianAssignRequest request) {
        MaintenanceRequestResponse response = maintenanceService.assignTechnician(requestId,
                request.technicianName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{requestId}/start")
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Start maintenance work", description = "Mark maintenance as In Progress")
    public ResponseEntity<MaintenanceRequestResponse> startMaintenance(@PathVariable Long requestId) {
        MaintenanceRequestResponse response = maintenanceService.startMaintenance(requestId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{requestId}/resolve")
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Resolve maintenance", description = "Mark maintenance as Resolved and return asset to Available")
    public ResponseEntity<MaintenanceRequestResponse> resolveMaintenance(@PathVariable Long requestId,
            @Valid @RequestBody MaintenanceResolveRequest request) {
        MaintenanceRequestResponse response = maintenanceService.resolveMaintenance(requestId,
                request.resolutionNotes());
        return ResponseEntity.ok(response);
    }
}
