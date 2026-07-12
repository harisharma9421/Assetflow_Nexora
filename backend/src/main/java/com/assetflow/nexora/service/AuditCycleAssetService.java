package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.AuditCycleAssetResponse;
import com.assetflow.nexora.entity.AuditCycle;
import com.assetflow.nexora.entity.AuditCycleAsset;
import com.assetflow.nexora.entity.AuditCycleAuditor;
import com.assetflow.nexora.entity.DiscrepancyReport;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.AuditCycleAssetRepository;
import com.assetflow.nexora.repository.AuditCycleAuditorRepository;
import com.assetflow.nexora.repository.AuditCycleRepository;
import com.assetflow.nexora.repository.DiscrepancyReportRepository;
import com.assetflow.nexora.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuditCycleAssetService {
    private final AuditCycleAssetRepository auditCycleAssets;
    private final AuditCycleRepository auditCycles;
    private final AuditCycleAuditorRepository auditors;
    private final DiscrepancyReportRepository discrepancyReports;
    private final UserRepository users;

    public AuditCycleAssetService(AuditCycleAssetRepository auditCycleAssets, AuditCycleRepository auditCycles,
            AuditCycleAuditorRepository auditors, DiscrepancyReportRepository discrepancyReports,
            UserRepository users) {
        this.auditCycleAssets = auditCycleAssets;
        this.auditCycles = auditCycles;
        this.auditors = auditors;
        this.discrepancyReports = discrepancyReports;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<AuditCycleAssetResponse> listAuditCycleAssets(Long auditCycleId) {
        // Validate audit cycle exists
        auditCycles.findById(auditCycleId).orElseThrow(
                () -> new ResourceNotFoundException("Audit cycle with id " + auditCycleId + " was not found"));

        return auditCycleAssets.findByAuditCycleId(auditCycleId).stream().map(this::toResponse).toList();
    }

    public AuditCycleAssetResponse verifyAsset(Long auditCycleAssetId, String verificationStatus, String notes,
            Long verifiedBy) {
        AuditCycleAsset auditAsset = auditCycleAssets.findById(auditCycleAssetId).orElseThrow(
                () -> new ResourceNotFoundException(
                        "Audit cycle asset with id " + auditCycleAssetId + " was not found"));

        // Validate audit cycle is in progress
        AuditCycle auditCycle = auditCycles.findById(auditAsset.auditCycleId).orElseThrow(
                () -> new ResourceNotFoundException(
                        "Audit cycle with id " + auditAsset.auditCycleId + " was not found"));

        if ("Closed".equals(auditCycle.status)) {
            throw new BadRequestException("Cannot verify assets in a closed audit cycle");
        }

        if (!"In Progress".equals(auditCycle.status)) {
            throw new BadRequestException("Only assets in in-progress audit cycles can be verified");
        }

        // Validate verifier is an assigned auditor
        AuditCycleAuditor.Key key = new AuditCycleAuditor.Key();
        key.auditCycleId = auditAsset.auditCycleId;
        key.auditorUserId = verifiedBy;

        if (auditors.findById(key).isEmpty()) {
            throw new BadRequestException("Only assigned auditors can verify assets");
        }

        // Validate verification status
        if (!isValidVerificationStatus(verificationStatus)) {
            throw new BadRequestException(
                    "Invalid verification status. Must be one of: Verified, Missing, Damaged");
        }

        // Update verification
        auditAsset.verificationStatus = verificationStatus;
        auditAsset.verifiedBy = verifiedBy;
        auditAsset.verifiedAt = OffsetDateTime.now(ZoneOffset.UTC);
        auditAsset.notes = notes;

        AuditCycleAsset saved = auditCycleAssets.save(auditAsset);

        // Create discrepancy report if Missing or Damaged
        if ("Missing".equals(verificationStatus) || "Damaged".equals(verificationStatus)) {
            createDiscrepancyReport(auditAsset.auditCycleId, auditAsset.assetId, verificationStatus, notes);
        }

        return toResponse(saved);
    }

    private void createDiscrepancyReport(Long auditCycleId, Long assetId, String issueType, String description) {
        DiscrepancyReport report = new DiscrepancyReport();
        report.auditCycleId = auditCycleId;
        report.assetId = assetId;
        report.issueType = issueType;
        report.description = description;
        report.resolutionStatus = "Open";
        report.createdAt = OffsetDateTime.now(ZoneOffset.UTC);

        discrepancyReports.save(report);
    }

    private boolean isValidVerificationStatus(String status) {
        return status != null
                && (status.equals("Verified") || status.equals("Missing") || status.equals("Damaged"));
    }

    private AuditCycleAssetResponse toResponse(AuditCycleAsset a) {
        return new AuditCycleAssetResponse(a.id, a.auditCycleId, a.assetId, a.verificationStatus, a.verifiedBy,
                a.verifiedAt, a.notes);
    }
}
