package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.DiscrepancyReportResponse;
import com.assetflow.nexora.dto.DiscrepancyResolveRequest;
import com.assetflow.nexora.service.DiscrepancyReportService;
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
@RequestMapping("/api/discrepancy-reports")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Audit", description = "Discrepancy report management APIs")
public class DiscrepancyReportController {
    private final DiscrepancyReportService discrepancyReportService;

    public DiscrepancyReportController(DiscrepancyReportService discrepancyReportService) {
        this.discrepancyReportService = discrepancyReportService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "List discrepancy reports", description = "List all discrepancy reports with optional filters")
    public ResponseEntity<List<DiscrepancyReportResponse>> listDiscrepancyReports(
            @RequestParam(required = false) Long auditCycleId,
            @RequestParam(required = false) String resolutionStatus) {
        List<DiscrepancyReportResponse> response = discrepancyReportService.listDiscrepancyReports(auditCycleId,
                resolutionStatus);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{discrepancyId}")
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Get discrepancy report details", description = "Get detailed information about a specific discrepancy report")
    public ResponseEntity<DiscrepancyReportResponse> getDiscrepancyReport(@PathVariable Long discrepancyId) {
        DiscrepancyReportResponse response = discrepancyReportService.getDiscrepancyReport(discrepancyId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{discrepancyId}/resolve")
    @PreAuthorize("hasAnyRole('ASSET_MANAGER', 'ADMIN')")
    @Operation(summary = "Resolve discrepancy", description = "Mark a discrepancy report as resolved")
    public ResponseEntity<DiscrepancyReportResponse> resolveDiscrepancy(@PathVariable Long discrepancyId,
            @Valid @RequestBody DiscrepancyResolveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = Long.parseLong(userDetails.getUsername());
        DiscrepancyReportResponse response = discrepancyReportService.resolveDiscrepancy(discrepancyId,
                request.resolutionNotes(), userId);
        return ResponseEntity.ok(response);
    }
}
