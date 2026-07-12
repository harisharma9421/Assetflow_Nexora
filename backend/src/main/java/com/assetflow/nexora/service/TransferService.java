package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.*;
import com.assetflow.nexora.entity.*;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TransferService {
    private final TransferRequestRepository transfers;
    private final AssetRepository assets;
    private final AssetAllocationRepository allocations;
    private final UserRepository users;
    private final DepartmentRepository departments;
    private final JdbcTemplate jdbc;

    public TransferService(TransferRequestRepository transfers, AssetRepository assets, 
            AssetAllocationRepository allocations, UserRepository users, 
            DepartmentRepository departments, JdbcTemplate jdbc) {
        this.transfers = transfers;
        this.assets = assets;
        this.allocations = allocations;
        this.users = users;
        this.departments = departments;
        this.jdbc = jdbc;
    }

    public TransferRequestResponse create(TransferRequestCreateRequest request) {
        // Validate asset exists
        Asset asset = assets.findById(request.assetId())
                .orElseThrow(() -> missing("Asset", request.assetId()));

        // Validate current allocation exists and is active
        AssetAllocation currentAllocation = allocations.findById(request.currentAllocationId())
                .orElseThrow(() -> missing("Asset allocation", request.currentAllocationId()));
        
        if (!currentAllocation.assetId.equals(request.assetId())) {
            throw new BadRequestException("Allocation does not match the asset");
        }
        
        if (!"Active".equals(currentAllocation.status)) {
            throw new BadRequestException("Only active allocations can be transferred");
        }

        // Validate requester
        users.findById(request.requestedBy())
                .orElseThrow(() -> missing("User", request.requestedBy()));

        // Validate target holder
        boolean hasEmployee = request.requestedToEmployeeId() != null;
        boolean hasDepartment = request.requestedToDepartmentId() != null;
        
        if ((hasEmployee && hasDepartment) || (!hasEmployee && !hasDepartment)) {
            throw new BadRequestException("Transfer must specify either requestedToEmployeeId or requestedToDepartmentId, not both");
        }

        if (hasEmployee) {
            users.findById(request.requestedToEmployeeId())
                    .orElseThrow(() -> missing("User", request.requestedToEmployeeId()));
        }
        
        if (hasDepartment) {
            departments.findById(request.requestedToDepartmentId())
                    .orElseThrow(() -> missing("Department", request.requestedToDepartmentId()));
        }

        TransferRequest transfer = new TransferRequest();
        transfer.assetId = request.assetId();
        transfer.currentAllocationId = request.currentAllocationId();
        transfer.requestedBy = request.requestedBy();
        transfer.requestedToEmployeeId = request.requestedToEmployeeId();
        transfer.requestedToDepartmentId = request.requestedToDepartmentId();
        transfer.reason = request.reason();
        transfer.status = "Requested";

        TransferRequest saved = transfers.save(transfer);
        return response(saved);
    }

    public TransferRequestResponse approve(Long transferId, TransferApproveRequest request) {
        TransferRequest transfer = findTransfer(transferId);
        
        if (!"Requested".equals(transfer.status)) {
            throw new BadRequestException("Only pending transfer requests can be approved");
        }

        // Validate approver
        users.findById(request.approvedBy())
                .orElseThrow(() -> missing("User", request.approvedBy()));

        // Get current allocation
        AssetAllocation currentAllocation = allocations.findById(transfer.currentAllocationId())
                .orElseThrow(() -> missing("Asset allocation", transfer.currentAllocationId()));

        // Return current allocation
        currentAllocation.status = "Returned";
        currentAllocation.actualReturnDate = LocalDate.now();
        currentAllocation.returnConditionNotes = "Returned for transfer: " + (request.notes() != null ? request.notes() : "");
        currentAllocation.returnedTo = request.approvedBy();
        allocations.save(currentAllocation);

        // Create new allocation
        AssetAllocation newAllocation = new AssetAllocation();
        newAllocation.assetId = transfer.assetId;
        newAllocation.allocatedBy = request.approvedBy();
        newAllocation.expectedReturnDate = request.expectedReturnDate();
        
        if (transfer.requestedToEmployeeId != null) {
            newAllocation.holderType = "Employee";
            newAllocation.holderEmployeeId = transfer.requestedToEmployeeId;
        } else {
            newAllocation.holderType = "Department";
            newAllocation.holderDepartmentId = transfer.requestedToDepartmentId;
        }
        
        AssetAllocation savedAllocation = allocations.save(newAllocation);

        // Update transfer
        transfer.status = "Approved";
        transfer.approvedBy = request.approvedBy();
        transfer.newAllocationId = savedAllocation.id;
        transfer.resolvedAt = OffsetDateTime.now(ZoneOffset.UTC);

        TransferRequest saved = transfers.save(transfer);
        
        // Asset status remains Allocated (handled by trigger)
        return response(saved);
    }

    public TransferRequestResponse reject(Long transferId, TransferRejectRequest request) {
        TransferRequest transfer = findTransfer(transferId);
        
        if (!"Requested".equals(transfer.status)) {
            throw new BadRequestException("Only pending transfer requests can be rejected");
        }

        // Validate rejector
        users.findById(request.rejectedBy())
                .orElseThrow(() -> missing("User", request.rejectedBy()));

        transfer.status = "Rejected";
        transfer.approvedBy = request.rejectedBy(); // Store who rejected it
        transfer.reason = (transfer.reason != null ? transfer.reason + " | Rejected: " : "Rejected: ") + request.reason();
        transfer.resolvedAt = OffsetDateTime.now(ZoneOffset.UTC);

        TransferRequest saved = transfers.save(transfer);
        return response(saved);
    }

    @Transactional(readOnly = true)
    public List<TransferRequestResponse> list(String status, Long assetId) {
        List<TransferRequest> result;
        if (assetId != null) {
            result = transfers.findByAssetId(assetId);
        } else if (status != null && !status.isBlank()) {
            result = transfers.findByStatus(status);
        } else {
            result = transfers.findAll();
        }
        return result.stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public TransferRequestResponse get(Long transferId) {
        return response(findTransfer(transferId));
    }

    private TransferRequest findTransfer(Long id) {
        return transfers.findById(id)
                .orElseThrow(() -> missing("Transfer request", id));
    }

    private ResourceNotFoundException missing(String type, Long id) {
        return new ResourceNotFoundException(type + " with id " + id + " was not found");
    }

    private TransferRequestResponse response(TransferRequest t) {
        return new TransferRequestResponse(
            t.id,
            t.assetId,
            t.currentAllocationId,
            t.requestedBy,
            t.requestedToEmployeeId,
            t.requestedToDepartmentId,
            t.reason,
            t.status,
            t.approvedBy,
            t.newAllocationId,
            t.requestedAt,
            t.resolvedAt
        );
    }
}
