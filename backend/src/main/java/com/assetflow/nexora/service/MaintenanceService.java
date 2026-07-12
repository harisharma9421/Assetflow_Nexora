package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.MaintenanceRequestCreateRequest;
import com.assetflow.nexora.dto.MaintenanceRequestResponse;
import com.assetflow.nexora.entity.Asset;
import com.assetflow.nexora.entity.MaintenanceRequest;
import com.assetflow.nexora.entity.User;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.AssetRepository;
import com.assetflow.nexora.repository.MaintenanceRequestRepository;
import com.assetflow.nexora.repository.UserRepository;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MaintenanceService {
    private final MaintenanceRequestRepository maintenanceRequests;
    private final AssetRepository assets;
    private final UserRepository users;

    public MaintenanceService(MaintenanceRequestRepository maintenanceRequests, AssetRepository assets,
            UserRepository users) {
        this.maintenanceRequests = maintenanceRequests;
        this.assets = assets;
        this.users = users;
    }

    public MaintenanceRequestResponse createMaintenanceRequest(MaintenanceRequestCreateRequest request,
            Long raisedBy) {
        // Validate asset exists
        Asset asset = assets.findById(request.assetId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Asset with id " + request.assetId() + " was not found"));

        // Validate user exists
        users.findById(raisedBy).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + raisedBy + " was not found"));

        // Validate priority
        if (!isValidPriority(request.priority())) {
            throw new BadRequestException(
                    "Invalid priority. Must be one of: Low, Medium, High, Critical");
        }

        // Create maintenance request
        MaintenanceRequest maintenance = new MaintenanceRequest();
        maintenance.assetId = request.assetId();
        maintenance.raisedBy = raisedBy;
        maintenance.issueDescription = request.issueDescription();
        maintenance.priority = request.priority();
        maintenance.status = "Pending";

        MaintenanceRequest saved = maintenanceRequests.save(maintenance);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRequestResponse> listMaintenanceRequests(String status, Long assetId) {
        List<MaintenanceRequest> result;

        if (assetId != null) {
            result = maintenanceRequests.findByAssetId(assetId);
        } else if (status != null && !status.isBlank()) {
            result = maintenanceRequests.findByStatus(status);
        } else {
            result = maintenanceRequests.findAll();
        }

        return result.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MaintenanceRequestResponse getMaintenanceRequest(Long requestId) {
        MaintenanceRequest request = findMaintenanceRequest(requestId);
        return toResponse(request);
    }

    private MaintenanceRequest findMaintenanceRequest(Long id) {
        return maintenanceRequests.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Maintenance request with id " + id + " was not found"));
    }

    private boolean isValidPriority(String priority) {
        return priority != null && (priority.equals("Low") || priority.equals("Medium")
                || priority.equals("High") || priority.equals("Critical"));
    }

    private MaintenanceRequestResponse toResponse(MaintenanceRequest m) {
        return new MaintenanceRequestResponse(m.id, m.assetId, m.raisedBy, m.issueDescription, m.priority,
                m.status, m.approvedBy, m.approvedAt, m.rejectionReason, m.technicianName,
                m.technicianAssignedAt, m.resolvedAt, m.resolutionNotes, m.createdAt, m.updatedAt);
    }
}
