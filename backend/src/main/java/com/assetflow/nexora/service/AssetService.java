package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.*;
import com.assetflow.nexora.entity.*;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.*;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final JdbcTemplate jdbc;

    public AssetService(AssetRepository assets, AssetCategoryRepository categories, UserRepository users,
            DepartmentRepository departments, CategoryCustomFieldRepository fields,
            AssetCustomFieldValueRepository values, AssetDocumentRepository documents,
            AssetStatusHistoryRepository history, AssetAllocationRepository allocations,
            MaintenanceRequestRepository maintenance, JdbcTemplate jdbc) {
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
        this.jdbc = jdbc;
    }

    public AssetDetailResponse create(AssetCreateRequest request) {
        validateReferences(request.categoryId(), request.owningDepartmentId(), request.createdBy());
        validateCondition(request.condition());
        Long assetId = jdbc.queryForObject(
                "INSERT INTO assets (asset_tag, name, category_id, serial_number, qr_code, acquisition_date, acquisition_cost, condition, location, status, is_bookable, owning_department_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS asset_condition), ?, CAST('Available' AS asset_status), ?, ?, ?) RETURNING asset_id",
                Long.class, blankToNull(request.assetTag()), request.name(), request.categoryId(),
                blankToNull(request.serialNumber()), blankToNull(request.qrCode()), request.acquisitionDate(),
                request.acquisitionCost(), request.condition(), blankToNull(request.location()), request.bookable(),
                request.owningDepartmentId(), request.createdBy());
        replaceCustomValues(assetId, request.categoryId(), request.customFields());
        return detail(find(assetId));
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> search(String search, String tag, String serialNumber, String qrCode, Long categoryId,
            String status, Long departmentId, String location) {
        Specification<Asset> specification = Specification.where(null);
        specification = specification.and(equal("assetTag", tag)).and(equal("serialNumber", serialNumber))
                .and(equal("qrCode", qrCode)).and(equal("categoryId", categoryId))
                .and(equal("owningDepartmentId", departmentId)).and(equal("location", location));
        if (search != null && !search.isBlank())
            specification = specification.and((root, query, builder) -> builder.or(
                    builder.like(builder.lower(root.get("assetTag")), like(search)),
                    builder.like(builder.lower(root.get("serialNumber")), like(search)),
                    builder.like(builder.lower(root.get("name")), like(search))));
        return assets.findAll(specification).stream().filter(asset -> status == null || status.equals(asset.status))
                .map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public AssetDetailResponse get(Long id) {
        return detail(find(id));
    }

    public AssetDetailResponse update(Long id, AssetUpdateRequest request) {
        validateReferences(request.categoryId(), request.owningDepartmentId(), null);
        validateCondition(request.condition());
        find(id);
        jdbc.update(
                "UPDATE assets SET name=?, category_id=?, serial_number=?, qr_code=?, acquisition_date=?, acquisition_cost=?, condition=CAST(? AS asset_condition), location=?, is_bookable=?, owning_department_id=? WHERE asset_id=?",
                request.name(), request.categoryId(), blankToNull(request.serialNumber()),
                blankToNull(request.qrCode()), request.acquisitionDate(), request.acquisitionCost(),
                request.condition(), blankToNull(request.location()), request.bookable(), request.owningDepartmentId(),
                id);
        replaceCustomValues(id, request.categoryId(), request.customFields());
        return detail(find(id));
    }

    public AssetDetailResponse updateStatus(Long id, AssetStatusUpdateRequest request) {
        Asset asset = find(id);
        users.findById(request.changedBy()).orElseThrow(() -> missing("User", request.changedBy()));
        validateStatus(request.status());
        String old = asset.status;
        jdbc.update("UPDATE assets SET status=CAST(? AS asset_status) WHERE asset_id=?", request.status(), id);
        jdbc.update(
                "INSERT INTO asset_status_history (asset_id, from_status, to_status, reason, changed_by) VALUES (?, CAST(? AS asset_status), CAST(? AS asset_status), ?, ?)",
                id, old, request.status(), blankToNull(request.reason()), request.changedBy());
        return detail(find(id));
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
        if (value == null)
            return null;
        return (root, query, builder) -> builder.equal(root.get(property), value);
    }

    private String like(String value) {
        return "%" + value.toLowerCase(Locale.ROOT) + "%";
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void validateCondition(String condition) {
        if (!Set.of("New", "Good", "Fair", "Poor", "Damaged").contains(condition))
            throw new IllegalArgumentException("Invalid asset condition");
    }

    private void validateStatus(String status) {
        if (!Set.of("Available", "Allocated", "Reserved", "Under Maintenance", "Lost", "Retired", "Disposed")
                .contains(status))
            throw new IllegalArgumentException("Invalid asset status");
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
