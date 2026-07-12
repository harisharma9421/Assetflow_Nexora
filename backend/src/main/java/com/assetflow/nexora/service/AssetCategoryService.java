package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.AssetCategoryDto;
import com.assetflow.nexora.dto.AssetCategoryRequest;
import com.assetflow.nexora.dto.CategoryCustomFieldDto;
import com.assetflow.nexora.dto.CategoryCustomFieldRequest;
import com.assetflow.nexora.dto.StatusUpdateRequest;
import com.assetflow.nexora.entity.AssetCategory;
import com.assetflow.nexora.entity.CategoryCustomField;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.AssetCategoryRepository;
import com.assetflow.nexora.repository.CategoryCustomFieldRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssetCategoryService {

    private final AssetCategoryRepository assetCategoryRepository;
    private final CategoryCustomFieldRepository categoryCustomFieldRepository;

    public AssetCategoryService(
            AssetCategoryRepository assetCategoryRepository,
            CategoryCustomFieldRepository categoryCustomFieldRepository) {
        this.assetCategoryRepository = assetCategoryRepository;
        this.categoryCustomFieldRepository = categoryCustomFieldRepository;
    }

    @Transactional(readOnly = true)
    public List<AssetCategoryDto> listCategories() {
        return assetCategoryRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AssetCategoryDto getCategory(Long categoryId) {
        return toDto(findCategory(categoryId));
    }

    @Transactional
    public AssetCategoryDto createCategory(AssetCategoryRequest request) {
        validateUniqueCategoryName(request.name(), null);
        AssetCategory category = new AssetCategory();
        applyRequest(category, request);
        return toDto(assetCategoryRepository.save(category));
    }

    @Transactional
    public AssetCategoryDto updateCategory(Long categoryId, AssetCategoryRequest request) {
        AssetCategory category = findCategory(categoryId);
        validateUniqueCategoryName(request.name(), categoryId);
        applyRequest(category, request);
        return toDto(assetCategoryRepository.save(category));
    }

    @Transactional
    public AssetCategoryDto updateStatus(Long categoryId, StatusUpdateRequest request) {
        AssetCategory category = findCategory(categoryId);
        category.status = request.status();
        return toDto(assetCategoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    public List<CategoryCustomFieldDto> listFields(Long categoryId) {
        ensureCategoryExists(categoryId);
        return categoryCustomFieldRepository.findByCategoryId(categoryId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public CategoryCustomFieldDto createField(Long categoryId, CategoryCustomFieldRequest request) {
        ensureCategoryExists(categoryId);
        validateUniqueFieldName(categoryId, request.fieldName(), null);

        CategoryCustomField field = new CategoryCustomField();
        field.categoryId = categoryId;
        applyFieldRequest(field, request);
        return toDto(categoryCustomFieldRepository.save(field));
    }

    @Transactional
    public CategoryCustomFieldDto updateField(Long fieldId, CategoryCustomFieldRequest request) {
        CategoryCustomField field = findField(fieldId);
        validateUniqueFieldName(field.categoryId, request.fieldName(), fieldId);
        applyFieldRequest(field, request);
        return toDto(categoryCustomFieldRepository.save(field));
    }

    @Transactional
    public void deleteField(Long fieldId) {
        CategoryCustomField field = findField(fieldId);
        categoryCustomFieldRepository.delete(field);
    }

    private void applyRequest(AssetCategory category, AssetCategoryRequest request) {
        category.name = request.name().trim();
        category.description = request.description();
        category.status = request.status() == null ? "Active" : request.status();
    }

    private void applyFieldRequest(CategoryCustomField field, CategoryCustomFieldRequest request) {
        field.fieldName = request.fieldName().trim();
        field.fieldType = request.fieldType();
        field.required = request.required();
    }

    private AssetCategory findCategory(Long categoryId) {
        return assetCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset category was not found"));
    }

    private CategoryCustomField findField(Long fieldId) {
        return categoryCustomFieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Category custom field was not found"));
    }

    private void ensureCategoryExists(Long categoryId) {
        if (!assetCategoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Asset category was not found");
        }
    }

    private void validateUniqueCategoryName(String name, Long currentCategoryId) {
        assetCategoryRepository.findByName(name.trim())
                .filter(existing -> !existing.id.equals(currentCategoryId))
                .ifPresent(existing -> {
                    throw new BadRequestException("Asset category name is already in use");
                });
    }

    private void validateUniqueFieldName(Long categoryId, String fieldName, Long currentFieldId) {
        categoryCustomFieldRepository.findByCategoryId(categoryId).stream()
                .filter(existing -> existing.fieldName.equalsIgnoreCase(fieldName.trim()))
                .filter(existing -> !existing.id.equals(currentFieldId))
                .findFirst()
                .ifPresent(existing -> {
                    throw new BadRequestException("Category field name is already in use");
                });
    }

    private AssetCategoryDto toDto(AssetCategory category) {
        return new AssetCategoryDto(category.id, category.name, category.description, category.status);
    }

    private CategoryCustomFieldDto toDto(CategoryCustomField field) {
        return new CategoryCustomFieldDto(
                field.id,
                field.categoryId,
                field.fieldName,
                field.fieldType,
                field.required);
    }
}
