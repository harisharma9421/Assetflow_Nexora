package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.DiscrepancyReportResponse;
import com.assetflow.nexora.entity.DiscrepancyReport;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.DiscrepancyReportRepository;
import com.assetflow.nexora.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DiscrepancyReportService {
    private final DiscrepancyReportRepository discrepancyReports;
    private final UserRepository users;

    public DiscrepancyReportService(DiscrepancyReportRepository discrepancyReports, UserRepository users) {
        this.discrepancyReports = discrepancyReports;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<DiscrepancyReportResponse> listDiscrepancyReports(Long auditCycleId, String resolutionStatus) {
        List<DiscrepancyReport> result;

        if (auditCycleId != null) {
            result = discrepancyReports.findByAuditCycleId(auditCycleId);
        } else {
            result = discrepancyReports.findAll();
        }

        // Filter by resolution status if provided
        if (resolutionStatus != null && !resolutionStatus.isBlank()) {
            String finalStatus = resolutionStatus;
            result = result.stream().filter(r -> finalStatus.equals(r.resolutionStatus)).toList();
        }

        return result.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DiscrepancyReportResponse getDiscrepancyReport(Long discrepancyId) {
        DiscrepancyReport report = findDiscrepancyReport(discrepancyId);
        return toResponse(report);
    }

    public DiscrepancyReportResponse resolveDiscrepancy(Long discrepancyId, String resolutionNotes, Long resolvedBy) {
        DiscrepancyReport report = findDiscrepancyReport(discrepancyId);

        // Validate discrepancy is open
        if (!"Open".equals(report.resolutionStatus)) {
            throw new BadRequestException("Only open discrepancies can be resolved");
        }

        // Validate resolver exists
        users.findById(resolvedBy).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + resolvedBy + " was not found"));

        // Resolve discrepancy
        report.resolutionStatus = "Resolved";
        report.resolvedBy = resolvedBy;
        report.resolvedAt = OffsetDateTime.now(ZoneOffset.UTC);

        // Update description with resolution notes if provided
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            report.description = (report.description != null ? report.description : "")
                    + "\n\nResolution: " + resolutionNotes;
        }

        DiscrepancyReport saved = discrepancyReports.save(report);
        return toResponse(saved);
    }

    private DiscrepancyReport findDiscrepancyReport(Long id) {
        return discrepancyReports.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Discrepancy report with id " + id + " was not found"));
    }

    private DiscrepancyReportResponse toResponse(DiscrepancyReport r) {
        return new DiscrepancyReportResponse(r.id, r.auditCycleId, r.assetId, r.issueType, r.description,
                r.resolutionStatus, r.resolvedBy, r.resolvedAt, r.createdAt);
    }
}
