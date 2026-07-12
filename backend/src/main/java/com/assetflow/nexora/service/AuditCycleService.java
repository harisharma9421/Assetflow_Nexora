package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.AuditCycleAuditorDto;
import com.assetflow.nexora.dto.AuditCycleCreateRequest;
import com.assetflow.nexora.dto.AuditCycleResponse;
import com.assetflow.nexora.entity.Asset;
import com.assetflow.nexora.entity.AuditCycle;
import com.assetflow.nexora.entity.AuditCycleAsset;
import com.assetflow.nexora.entity.AuditCycleAuditor;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.AssetRepository;
import com.assetflow.nexora.repository.AuditCycleAssetRepository;
import com.assetflow.nexora.repository.AuditCycleAuditorRepository;
import com.assetflow.nexora.repository.AuditCycleRepository;
import com.assetflow.nexora.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuditCycleService {
    private final AuditCycleRepository auditCycles;
    private final AuditCycleAuditorRepository auditors;
    private final AuditCycleAssetRepository auditCycleAssets;
    private final AssetRepository assets;
    private final UserRepository users;

    public AuditCycleService(AuditCycleRepository auditCycles, AuditCycleAuditorRepository auditors,
            AuditCycleAssetRepository auditCycleAssets, AssetRepository assets, UserRepository users) {
        this.auditCycles = auditCycles;
        this.auditors = auditors;
        this.auditCycleAssets = auditCycleAssets;
        this.assets = assets;
        this.users = users;
    }

    public AuditCycleResponse createAuditCycle(AuditCycleCreateRequest request, Long createdBy) {
        // Validate user exists
        users.findById(createdBy).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + createdBy + " was not found"));

        // Validate dates
        if (!request.endDate().isAfter(request.startDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        // Validate scope (at least one must be provided)
        if (request.scopeDepartmentId() == null && (request.scopeLocation() == null || request.scopeLocation().isBlank())) {
            throw new BadRequestException("Either department or location scope must be provided");
        }

        // Create audit cycle
        AuditCycle auditCycle = new AuditCycle();
        auditCycle.name = request.name();
        auditCycle.scopeDepartmentId = request.scopeDepartmentId();
        auditCycle.scopeLocation = request.scopeLocation();
        auditCycle.startDate = request.startDate();
        auditCycle.endDate = request.endDate();
        auditCycle.status = "Planned";
        auditCycle.createdBy = createdBy;
        auditCycle.createdAt = OffsetDateTime.now(ZoneOffset.UTC);

        AuditCycle saved = auditCycles.save(auditCycle);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AuditCycleResponse> listAuditCycles(String status) {
        List<AuditCycle> result;

        if (status != null && !status.isBlank()) {
            result = auditCycles.findByStatus(status);
        } else {
            result = auditCycles.findAll();
        }

        return result.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AuditCycleResponse getAuditCycle(Long auditCycleId) {
        AuditCycle auditCycle = findAuditCycle(auditCycleId);
        return toResponse(auditCycle);
    }

    protected AuditCycle findAuditCycle(Long id) {
        return auditCycles.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit cycle with id " + id + " was not found"));
    }

    private AuditCycleResponse toResponse(AuditCycle a) {
        return new AuditCycleResponse(a.id, a.name, a.scopeDepartmentId, a.scopeLocation, a.startDate, a.endDate,
                a.status, a.createdBy, a.closedBy, a.closedAt, a.createdAt);
    }

    public AuditCycleAuditorDto assignAuditor(Long auditCycleId, Long auditorUserId) {
        // Validate audit cycle exists and is in Planned status
        AuditCycle auditCycle = findAuditCycle(auditCycleId);
        if (!"Planned".equals(auditCycle.status)) {
            throw new BadRequestException("Auditors can only be assigned to planned audit cycles");
        }

        // Validate auditor user exists
        users.findById(auditorUserId).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + auditorUserId + " was not found"));

        // Check if auditor is already assigned
        AuditCycleAuditor.Key key = new AuditCycleAuditor.Key();
        key.auditCycleId = auditCycleId;
        key.auditorUserId = auditorUserId;

        if (auditors.findById(key).isPresent()) {
            throw new BadRequestException("Auditor is already assigned to this audit cycle");
        }

        // Assign auditor
        AuditCycleAuditor auditor = new AuditCycleAuditor();
        auditor.auditCycleId = auditCycleId;
        auditor.auditorUserId = auditorUserId;
        auditor.assignedAt = OffsetDateTime.now(ZoneOffset.UTC);

        AuditCycleAuditor saved = auditors.save(auditor);
        return new AuditCycleAuditorDto(saved.auditCycleId, saved.auditorUserId, saved.assignedAt);
    }

    @Transactional(readOnly = true)
    public List<AuditCycleAuditorDto> listAuditors(Long auditCycleId) {
        // Validate audit cycle exists
        findAuditCycle(auditCycleId);

        return auditors.findByAuditCycleId(auditCycleId).stream()
                .map(a -> new AuditCycleAuditorDto(a.auditCycleId, a.auditorUserId, a.assignedAt)).toList();
    }

    public AuditCycleResponse startAuditCycle(Long auditCycleId) {
        AuditCycle auditCycle = findAuditCycle(auditCycleId);

        // Validate audit cycle is in Planned status
        if (!"Planned".equals(auditCycle.status)) {
            throw new BadRequestException("Only planned audit cycles can be started");
        }

        // Validate at least one auditor is assigned
        List<AuditCycleAuditor> assignedAuditors = auditors.findByAuditCycleId(auditCycleId);
        if (assignedAuditors.isEmpty()) {
            throw new BadRequestException("At least one auditor must be assigned before starting the audit cycle");
        }

        // Generate audit cycle assets based on scope
        List<Asset> scopedAssets;
        if (auditCycle.scopeDepartmentId != null) {
            scopedAssets = assets.findAll().stream()
                    .filter(a -> auditCycle.scopeDepartmentId.equals(a.owningDepartmentId)).toList();
        } else if (auditCycle.scopeLocation != null && !auditCycle.scopeLocation.isBlank()) {
            scopedAssets = assets.findAll().stream()
                    .filter(a -> auditCycle.scopeLocation.equals(a.location)).toList();
        } else {
            throw new BadRequestException("Audit cycle must have a valid scope");
        }

        // Create audit cycle asset entries
        for (Asset asset : scopedAssets) {
            AuditCycleAsset auditAsset = new AuditCycleAsset();
            auditAsset.auditCycleId = auditCycleId;
            auditAsset.assetId = asset.id;
            auditAsset.verificationStatus = "Pending";
            auditCycleAssets.save(auditAsset);
        }

        // Update audit cycle status to In Progress
        auditCycle.status = "In Progress";
        AuditCycle saved = auditCycles.save(auditCycle);

        return toResponse(saved);
    }

    public AuditCycleResponse closeAuditCycle(Long auditCycleId, Long closedBy) {
        AuditCycle auditCycle = findAuditCycle(auditCycleId);

        // Validate audit cycle is in In Progress status
        if (!"In Progress".equals(auditCycle.status)) {
            throw new BadRequestException("Only in-progress audit cycles can be closed");
        }

        // Validate user exists
        users.findById(closedBy).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + closedBy + " was not found"));

        // Close the audit cycle
        auditCycle.status = "Closed";
        auditCycle.closedBy = closedBy;
        auditCycle.closedAt = OffsetDateTime.now(ZoneOffset.UTC);

        // Update confirmed missing assets to Lost status
        List<AuditCycleAsset> missingAssets = auditCycleAssets.findByAuditCycleId(auditCycleId).stream()
                .filter(a -> "Missing".equals(a.verificationStatus)).toList();

        for (AuditCycleAsset missingAsset : missingAssets) {
            Asset asset = assets.findById(missingAsset.assetId).orElse(null);
            if (asset != null) {
                asset.status = "Lost";
                assets.save(asset);
            }
        }

        AuditCycle saved = auditCycles.save(auditCycle);
        return toResponse(saved);
    }
}
