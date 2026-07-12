package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.MaintenanceAttachmentDto;
import com.assetflow.nexora.dto.MaintenanceRequestCreateRequest;
import com.assetflow.nexora.dto.MaintenanceRequestResponse;
import com.assetflow.nexora.entity.Asset;
import com.assetflow.nexora.entity.MaintenanceAttachment;
import com.assetflow.nexora.entity.MaintenanceRequest;
import com.assetflow.nexora.entity.User;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.AssetRepository;
import com.assetflow.nexora.repository.MaintenanceAttachmentRepository;
import com.assetflow.nexora.repository.MaintenanceRequestRepository;
import com.assetflow.nexora.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class MaintenanceService {
    private final MaintenanceRequestRepository maintenanceRequests;
    private final MaintenanceAttachmentRepository attachments;
    private final AssetRepository assets;
    private final UserRepository users;
    private final MaintenanceFileStorageService fileStorage;
    private final ActivityLogService activityLogService;
    private final JdbcTemplate jdbc;

    public MaintenanceService(MaintenanceRequestRepository maintenanceRequests,
            MaintenanceAttachmentRepository attachments, AssetRepository assets, UserRepository users,
            MaintenanceFileStorageService fileStorage, ActivityLogService activityLogService,
            JdbcTemplate jdbc) {
        this.maintenanceRequests = maintenanceRequests;
        this.attachments = attachments;
        this.assets = assets;
        this.users = users;
        this.fileStorage = fileStorage;
        this.activityLogService = activityLogService;
        this.jdbc = jdbc;
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

    public MaintenanceAttachmentDto uploadAttachment(Long requestId, MultipartFile file, Long uploadedBy) {
        // Validate maintenance request exists
        MaintenanceRequest request = findMaintenanceRequest(requestId);

        // Validate user exists
        users.findById(uploadedBy).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + uploadedBy + " was not found"));

        // Store file
        String fileUrl = fileStorage.store(requestId, file);

        // Save attachment record
        MaintenanceAttachment attachment = new MaintenanceAttachment();
        attachment.requestId = requestId;
        attachment.fileUrl = fileUrl;
        attachment.uploadedBy = uploadedBy;
        attachment.uploadedAt = OffsetDateTime.now(ZoneOffset.UTC);

        MaintenanceAttachment saved = attachments.save(attachment);
        return new MaintenanceAttachmentDto(saved.id, saved.requestId, saved.fileUrl, saved.uploadedBy,
                saved.uploadedAt);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceAttachmentDto> listAttachments(Long requestId) {
        // Validate maintenance request exists
        findMaintenanceRequest(requestId);

        return attachments.findByRequestId(requestId).stream()
                .map(a -> new MaintenanceAttachmentDto(a.id, a.requestId, a.fileUrl, a.uploadedBy,
                        a.uploadedAt))
                .toList();
    }

    public MaintenanceRequestResponse approveMaintenance(Long requestId, Long approvedBy) {
        MaintenanceRequest request = findMaintenanceRequest(requestId);

        // Validate request is in Pending status
        if (!"Pending".equals(request.status)) {
            throw new BadRequestException("Only pending maintenance requests can be approved");
        }

        // Validate approver exists and is Asset Manager
        users.findById(approvedBy).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + approvedBy + " was not found"));

        // Approve the request
        request.status = "Approved";
        request.approvedBy = approvedBy;
        request.approvedAt = OffsetDateTime.now(ZoneOffset.UTC);

        // Update asset status to Under Maintenance
        Asset asset = assets.findById(request.assetId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Asset with id " + request.assetId + " was not found"));
        asset.status = "Under Maintenance";
        assets.save(asset);

        MaintenanceRequest saved = maintenanceRequests.save(request);

        // Create activity log
        activityLogService.log("MAINTENANCE_APPROVED", "maintenance", saved.id, approvedBy,
                Map.of("assetId", saved.assetId, "priority", saved.priority, "raisedBy", saved.raisedBy));

        // Create notification for requester
        createNotification(saved.raisedBy, "Maintenance Approved",
                "Your maintenance request has been approved", "maintenance", saved.id);

        return toResponse(saved);
    }

    public MaintenanceRequestResponse rejectMaintenance(Long requestId, String rejectionReason,
            Long rejectedBy) {
        MaintenanceRequest request = findMaintenanceRequest(requestId);

        // Validate request is in Pending status
        if (!"Pending".equals(request.status)) {
            throw new BadRequestException("Only pending maintenance requests can be rejected");
        }

        // Validate rejector exists
        users.findById(rejectedBy).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + rejectedBy + " was not found"));

        // Reject the request
        request.status = "Rejected";
        request.approvedBy = rejectedBy; // Track who rejected
        request.approvedAt = OffsetDateTime.now(ZoneOffset.UTC);
        request.rejectionReason = rejectionReason;

        MaintenanceRequest saved = maintenanceRequests.save(request);

        // Create activity log
        activityLogService.log("MAINTENANCE_REJECTED", "maintenance", saved.id, rejectedBy, Map.of("assetId",
                saved.assetId, "reason", rejectionReason != null ? rejectionReason : "", "raisedBy",
                saved.raisedBy));

        // Create notification for requester
        createNotification(saved.raisedBy, "Maintenance Rejected",
                "Your maintenance request has been rejected: " + (rejectionReason != null ? rejectionReason : ""),
                "maintenance", saved.id);

        return toResponse(saved);
    }

    public MaintenanceRequestResponse assignTechnician(Long requestId, String technicianName) {
        MaintenanceRequest request = findMaintenanceRequest(requestId);

        // Validate request is in Approved status
        if (!"Approved".equals(request.status)) {
            throw new BadRequestException(
                    "Only approved maintenance requests can have technicians assigned");
        }

        // Assign technician and update status
        request.technicianName = technicianName;
        request.technicianAssignedAt = OffsetDateTime.now(ZoneOffset.UTC);
        request.status = "Technician Assigned";

        MaintenanceRequest saved = maintenanceRequests.save(request);

        // Create activity log
        activityLogService.log("TECHNICIAN_ASSIGNED", "maintenance", saved.id, request.raisedBy,
                Map.of("assetId", saved.assetId, "technicianName", technicianName));

        return toResponse(saved);
    }

    public MaintenanceRequestResponse startMaintenance(Long requestId) {
        MaintenanceRequest request = findMaintenanceRequest(requestId);

        // Validate request is in Technician Assigned status
        if (!"Technician Assigned".equals(request.status)) {
            throw new BadRequestException(
                    "Only maintenance with assigned technician can be started");
        }

        // Update status to In Progress
        request.status = "In Progress";

        MaintenanceRequest saved = maintenanceRequests.save(request);
        return toResponse(saved);
    }

    public MaintenanceRequestResponse resolveMaintenance(Long requestId, String resolutionNotes) {
        MaintenanceRequest request = findMaintenanceRequest(requestId);

        // Validate request is in In Progress status
        if (!"In Progress".equals(request.status)) {
            throw new BadRequestException("Only in-progress maintenance can be resolved");
        }

        // Resolve the maintenance
        request.status = "Resolved";
        request.resolvedAt = OffsetDateTime.now(ZoneOffset.UTC);
        request.resolutionNotes = resolutionNotes;

        // Return asset to Available status
        Asset asset = assets.findById(request.assetId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Asset with id " + request.assetId + " was not found"));
        asset.status = "Available";
        assets.save(asset);

        MaintenanceRequest saved = maintenanceRequests.save(request);

        // Create activity log
        activityLogService.log("MAINTENANCE_RESOLVED", "maintenance", saved.id, request.raisedBy,
                Map.of("assetId", saved.assetId, "technicianName",
                        saved.technicianName != null ? saved.technicianName : "", "resolutionNotes",
                        resolutionNotes != null ? resolutionNotes : ""));

        // Create notification for requester
        createNotification(saved.raisedBy, "Maintenance Resolved",
                "Your maintenance request has been resolved", "maintenance", saved.id);

        return toResponse(saved);
    }

    private void createNotification(Long userId, String title, String message, String relatedEntityType,
            Long relatedEntityId) {
        jdbc.update(
                "INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id) VALUES (?, CAST(? AS notification_type), ?, ?, ?, ?)",
                userId, "Maintenance Update", title, message, relatedEntityType, relatedEntityId);
    }
}
