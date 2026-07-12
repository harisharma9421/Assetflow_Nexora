package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.*;
import com.assetflow.nexora.entity.*;
import com.assetflow.nexora.exception.AllocationConflictException;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AllocationService {
    private static final String ACTIVE = "Active";
    private static final Set<String> HOLDER_TYPES = Set.of("Employee", "Department");

    private final AssetRepository assets;
    private final AssetAllocationRepository allocations;
    private final UserRepository users;
    private final DepartmentRepository departments;
    private final JdbcTemplate jdbc;

    public AllocationService(AssetRepository assets, AssetAllocationRepository allocations, UserRepository users,
            DepartmentRepository departments, JdbcTemplate jdbc) {
        this.assets = assets;
        this.allocations = allocations;
        this.users = users;
        this.departments = departments;
        this.jdbc = jdbc;
    }

    public AssetAllocationResponse allocate(AssetAllocationRequest request) {
        Asset asset = findAsset(request.assetId());
        validateAllocator(request.allocatedBy());
        validateHolder(request.holderType(), request.holderEmployeeId(), request.holderDepartmentId());
        if (!"Available".equals(asset.status))
            throw new BadRequestException("Asset must be Available before allocation");
        
        // Check for existing active allocation and throw conflict with current holder details
        allocations.findByAssetIdAndStatus(asset.id, ACTIVE)
                .ifPresent(existing -> {
                    AssetAllocationResponse currentHolder = response(existing);
                    throw new AllocationConflictException(
                        "Asset is already allocated. Please use transfer request workflow instead.", 
                        currentHolder
                    );
                });

        AssetAllocation allocation = new AssetAllocation();
        allocation.assetId = asset.id;
        allocation.holderType = normalizeHolderType(request.holderType());
        allocation.holderEmployeeId = allocation.holderType.equals("Employee") ? request.holderEmployeeId() : null;
        allocation.holderDepartmentId = allocation.holderType.equals("Department") ? request.holderDepartmentId()
                : null;
        allocation.allocatedBy = request.allocatedBy();
        allocation.expectedReturnDate = request.expectedReturnDate();
        AssetAllocation saved = allocations.save(allocation);
        updateAssetStatus(asset.id, asset.status, "Allocated", "Asset allocated", request.allocatedBy());
        return response(saved);
    }

    public AssetAllocationResponse returnAsset(Long allocationId, AssetReturnRequest request) {
        AssetAllocation allocation = allocations.findById(allocationId)
                .orElseThrow(() -> missing("Asset allocation", allocationId));
        if (!ACTIVE.equals(allocation.status))
            throw new BadRequestException("Only active allocations can be returned");
        Asset asset = findAsset(allocation.assetId);
        validateAllocator(request.returnedTo());
        validateCondition(request.assetCondition());

        allocation.status = "Returned";
        allocation.actualReturnDate = request.actualReturnDate() == null ? LocalDate.now() : request.actualReturnDate();
        allocation.returnConditionNotes = blankToNull(request.conditionNotes());
        allocation.returnedTo = request.returnedTo();
        AssetAllocation saved = allocations.save(allocation);

        if (request.assetCondition() != null && !request.assetCondition().isBlank()) {
            jdbc.update("UPDATE assets SET condition=CAST(? AS asset_condition) WHERE asset_id=?",
                    request.assetCondition(), asset.id);
        }
        updateAssetStatus(asset.id, asset.status, "Available", "Asset returned", request.returnedTo());
        return response(saved);
    }

    @Transactional(readOnly = true)
    public List<AssetAllocationResponse> list(String status, Long assetId, Long employeeId, Long departmentId,
            Boolean overdue) {
        List<AssetAllocation> result;
        if (Boolean.TRUE.equals(overdue)) {
            result = allocations.findByStatusAndExpectedReturnDateBefore(ACTIVE, LocalDate.now());
        } else if (assetId != null) {
            result = allocations.findByAssetIdOrderByAllocationDateDesc(assetId);
        } else if (employeeId != null) {
            result = allocations.findByHolderEmployeeIdAndStatus(employeeId, status == null ? ACTIVE : status);
        } else if (departmentId != null) {
            result = allocations.findByHolderDepartmentIdAndStatus(departmentId, status == null ? ACTIVE : status);
        } else if (status != null && !status.isBlank()) {
            result = allocations.findByStatus(status);
        } else {
            result = allocations.findAll();
        }
        return result.stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public AssetAllocationResponse get(Long allocationId) {
        return response(allocations.findById(allocationId).orElseThrow(() -> missing("Asset allocation", allocationId)));
    }

    @Transactional(readOnly = true)
    public List<AssetAllocationResponse> listOverdue() {
        return allocations.findByStatusAndExpectedReturnDateBefore(ACTIVE, LocalDate.now()).stream()
                .map(this::response)
                .toList();
    }

    private void validateHolder(String holderType, Long employeeId, Long departmentId) {
        String normalized = normalizeHolderType(holderType);
        if (!HOLDER_TYPES.contains(normalized))
            throw new BadRequestException("holderType must be Employee or Department");
        if (normalized.equals("Employee")) {
            if (employeeId == null || departmentId != null)
                throw new BadRequestException("Employee allocations require holderEmployeeId only");
            users.findById(employeeId).orElseThrow(() -> missing("User", employeeId));
        }
        if (normalized.equals("Department")) {
            if (departmentId == null || employeeId != null)
                throw new BadRequestException("Department allocations require holderDepartmentId only");
            departments.findById(departmentId).orElseThrow(() -> missing("Department", departmentId));
        }
    }

    private void validateAllocator(Long userId) {
        users.findById(userId).orElseThrow(() -> missing("User", userId));
    }

    private void validateCondition(String condition) {
        if (condition != null && !condition.isBlank()
                && !Set.of("New", "Good", "Fair", "Poor", "Damaged").contains(condition))
            throw new BadRequestException("Invalid asset condition");
    }

    private Asset findAsset(Long assetId) {
        return assets.findById(assetId).orElseThrow(() -> missing("Asset", assetId));
    }

    private String normalizeHolderType(String holderType) {
        if (holderType == null)
            return "";
        String value = holderType.trim().toLowerCase();
        if (value.equals("employee"))
            return "Employee";
        if (value.equals("department"))
            return "Department";
        return holderType.trim();
    }

    private void updateAssetStatus(Long assetId, String oldStatus, String newStatus, String reason, Long changedBy) {
        jdbc.update("UPDATE assets SET status=CAST(? AS asset_status) WHERE asset_id=?", newStatus, assetId);
        jdbc.update(
                "INSERT INTO asset_status_history (asset_id, from_status, to_status, reason, changed_by) VALUES (?, CAST(? AS asset_status), CAST(? AS asset_status), ?, ?)",
                assetId, oldStatus, newStatus, reason, changedBy);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResourceNotFoundException missing(String type, Long id) {
        return new ResourceNotFoundException(type + " with id " + id + " was not found");
    }

    public AssetAllocationResponse response(AssetAllocation a) {
        return new AssetAllocationResponse(a.id, a.assetId, a.holderType, a.holderEmployeeId, a.holderDepartmentId,
                a.allocationDate, a.expectedReturnDate, a.actualReturnDate, a.status);
    }
}
