package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.AuditCycleCreateRequest;
import com.assetflow.nexora.dto.AuditCycleResponse;
import com.assetflow.nexora.entity.AuditCycle;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
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
    private final UserRepository users;

    public AuditCycleService(AuditCycleRepository auditCycles, UserRepository users) {
        this.auditCycles = auditCycles;
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
}
