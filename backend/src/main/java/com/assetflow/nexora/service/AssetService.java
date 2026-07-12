package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.*;
import com.assetflow.nexora.entity.*;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AssetService {
    private final AssetRepository assets;
    private final AssetCategoryRepository categories;
    private final UserRepository users;
    private final DepartmentRepository departments;
    private final CategoryCustomFieldRepository fields;
    private final AssetCustomFieldValueRepository values;
    private final AssetDocumentRepository documents;
    private final AssetStatusHistoryRepository history;
    private final AssetAllocationRepository allocations;
    private final MaintenanceRequestRepository maintenance;

    public AssetService(AssetRepository assets, AssetCategoryRepository categories, UserRepository users,
            DepartmentRepository departments, CategoryCustomFieldRepository fields,
            AssetCustomFieldValueRepository values, AssetDocumentRepository documents,
            AssetStatusHistoryRepository history, AssetAllocationRepository allocations,
            MaintenanceRequestRepository maintenance) {
        this.assets = assets;
        this.categories = categories;
        this.users = users;
        this.departments = departments;
        this.fields = fields;
        this.values = values;
        this.documents = documents;
        this.history = history;
        this.allocations = allocations;
        this.maintenance = maintenance;
    }

    public AssetDetailResponse create(AssetCreateRequest request) {
        validateReferences(request.categoryId(), request.owningDepartmentId(), request.createdBy());
        Asset asset = new Asset();
        asset.assetTag = blankToNull(request.assetTag());
        asset.name = request.name();
        asset.categoryId = request.categoryId();
        asset.serialNumber = blankToNull(request.serialNumber());
        asset.qrCode = blankToNull(request.qrCode());
        asset.acquisitionDate = request.acquisitionDate();
        asset.acquisitionCost = request.acquisitionCost();
        asset.condition = request.condition();
        asset.location = blankToNull(request.location());
        asset.bookable = request.bookable();
        asset.owningDepartmentId = request.owningDepartmentId();
        asset.createdBy = request.createdBy();
        asset = assets.saveAndFlush(asset);
        replaceCustomValues(asset.id, asset.categoryId, request.customFields());
        return detail(asset);
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> search(String search, String tag, String serialNumber, String qrCode, Long categoryId,
            String status, Long departmentId, String location) {
        Specification<Asset> specification = Specification.where(null);
        specification = specification.and(equal("assetTag", tag)).and(equal("serialNumber", serialNumber))
                .and(equal("qrCode", qrCode)).and(equal("categoryId", categoryId)).and(equal("status", status))
                .and(equal("owningDepartmentId", departmentId)).and(equal("location", location));
        if (search != null && !search.isBlank())
            specification = specification.and((root, query, builder) -> builder.or(
                    builder.like(builder.lower(root.get("assetTag")), like(search)),
                    builder.like(builder.lower(root.get("serialNumber")), like(search)),
                    builder.like(builder.lower(root.get("name")), like(search))));
        return assets.findAll(specification).stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public AssetDetailResponse get(Long id) {
        return detail(find(id));
    }

    public AssetDetailResponse update(Long id, AssetUpdateRequest request) {
        validateReferences(request.categoryId(), request.owningDepartmentId(), null);
        Asset asset = find(id);
        asset.name = request.name();
        asset.categoryId = request.categoryId();
        asset.serialNumber = blankToNull(request.serialNumber());
        asset.qrCode = blankToNull(request.qrCode());
        asset.acquisitionDate = request.acquisitionDate();
        asset.acquisitionCost = request.acquisitionCost();
        asset.condition = request.condition();
        asset.location = blankToNull(request.location());
        asset.bookable = request.bookable();
        asset.owningDepartmentId = request.owningDepartmentId();
        assets.save(asset);
        replaceCustomValues(asset.id, asset.categoryId, request.customFields());
        return detail(asset);
    }

    public AssetDetailResponse updateStatus(Long id, AssetStatusUpdateRequest request) {
        Asset asset = find(id);
        users.findById(request.changedBy()).orElseThrow(() -> missing("User", request.changedBy()));
        String old = asset.status;
        asset.status = request.status();
        assets.save(asset);
        AssetStatusHistory event = new AssetStatusHistory();
        event.assetId = id;
        event.fromStatus = old;
        event.toStatus = request.status();
        event.reason = blankToNull(request.reason());
        event.changedBy = request.changedBy();
        event.changedAt = OffsetDateTime.now(ZoneOffset.UTC);
        history.save(event);
        return detail(asset);
    }

    public AssetDocumentResponse addDocument(Long assetId, String fileUrl, String fileType, Long uploadedBy) {
        find(assetId);
        users.findById(uploadedBy).orElseThrow(() -> missing("User", uploadedBy));
        AssetDocument document = new AssetDocument();
        document.assetId = assetId;
        document.fileUrl = fileUrl;
        document.fileType = blankToNull(fileType);
        document.uploadedBy = uploadedBy;
        document.uploadedAt = OffsetDateTime.now(ZoneOffset.UTC);
        return documentResponse(documents.save(document));
    }

    @Transactional(readOnly = true)
    public AssetHistoryResponse history(Long id) {
        find(id);
        return new AssetHistoryResponse(
                history.findByAssetIdOrderByChangedAtDesc(id).stream().map(this::historyResponse).toList(),
                allocations.findByAssetIdOrderByAllocationDateDesc(id).stream().map(this::allocationResponse).toList(),
                maintenance.findByAssetId(id).stream().map(this::maintenanceResponse).toList(),
                documents.findByAssetIdOrderByUploadedAtDesc(id).stream().map(this::documentResponse).toList());
    }

    private void validateReferences(Long categoryId, Long departmentId, Long userId) {
        categories.findById(categoryId).orElseThrow(() -> missing("Asset category", categoryId));
        if (departmentId != null)
            departments.findById(departmentId).orElseThrow(() -> missing("Department", departmentId));
        if (userId != null)
            users.findById(userId).orElseThrow(() -> missing("User", userId));
    }

    private void replaceCustomValues(Long assetId, Long categoryId, Map<Long, String> customFields) {
        if (customFields == null)
            return;
        values.findByAssetId(assetId).forEach(values::delete);
        customFields.forEach((fieldId, value) -> {
            CategoryCustomField field = fields.findById(fieldId)
                    .orElseThrow(() -> missing("Category custom field", fieldId));
            if (!categoryId.equals(field.categoryId))
                throw new IllegalArgumentException("Custom field does not belong to the asset category");
            AssetCustomFieldValue item = new AssetCustomFieldValue();
            item.assetId = assetId;
            item.fieldId = fieldId;
            item.fieldValue = value;
            values.save(item);
        });
    }

    private Asset find(Long id) {
        return assets.findById(id).orElseThrow(() -> missing("Asset", id));
    }

    private ResourceNotFoundException missing(String type, Long id) {
        return new ResourceNotFoundException(type + " with id " + id + " was not found");
    }

    private Specification<Asset> equal(String property, Object value) {
        return value == null ? null : (root, query, builder) -> builder.equal(root.get(property), value);
    }

    private String like(String value) {
        return "%" + value.toLowerCase(Locale.ROOT) + "%";
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private AssetResponse response(Asset a) {
        return new AssetResponse(a.id, a.assetTag, a.name, a.categoryId, a.serialNumber, a.qrCode, a.condition,
                a.location, a.status, a.bookable, a.owningDepartmentId);
    }

    private AssetDetailResponse detail(Asset a) {
        return new AssetDetailResponse(a.id, a.assetTag, a.name, a.categoryId, a.serialNumber, a.qrCode,
                a.acquisitionDate, a.acquisitionCost, a.condition, a.location, a.status, a.bookable,
                a.owningDepartmentId,
                values.findByAssetId(a.id).stream()
                        .map(v -> new AssetCustomFieldValueDto(v.id, v.assetId, v.fieldId, v.fieldValue)).toList(),
                documents.findByAssetIdOrderByUploadedAtDesc(a.id).stream().map(this::documentResponse).toList(),
                allocations.findByAssetIdOrderByAllocationDateDesc(a.id).stream().map(this::allocationResponse)
                        .toList(),
                maintenance.findByAssetId(a.id).stream().map(this::maintenanceResponse).toList());
    }

    private AssetDocumentResponse documentResponse(AssetDocument d) {
        return new AssetDocumentResponse(d.id, d.fileUrl, d.fileType, d.uploadedBy, d.uploadedAt);
    }

    private AssetStatusHistoryDto historyResponse(AssetStatusHistory h) {
        return new AssetStatusHistoryDto(h.id, h.assetId, h.fromStatus, h.toStatus, h.reason, h.changedBy, h.changedAt);
    }

    private AssetAllocationResponse allocationResponse(AssetAllocation a) {
        return new AssetAllocationResponse(a.id, a.assetId, a.holderType, a.holderEmployeeId, a.holderDepartmentId,
                a.allocationDate, a.expectedReturnDate, a.actualReturnDate, a.status);
    }

    private MaintenanceRequestDto maintenanceResponse(MaintenanceRequest m) {
        return new MaintenanceRequestDto(m.id, m.assetId, m.issueDescription, m.priority, m.status, m.technicianName,
                m.resolutionNotes);
    }
}
