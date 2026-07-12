package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.AssetCategoryDto;
import com.assetflow.nexora.dto.AssetCategoryRequest;
import com.assetflow.nexora.dto.CategoryCustomFieldDto;
import com.assetflow.nexora.dto.CategoryCustomFieldRequest;
import com.assetflow.nexora.dto.StatusUpdateRequest;
import com.assetflow.nexora.service.AssetCategoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AssetCategoryController {

    private final AssetCategoryService assetCategoryService;

    public AssetCategoryController(AssetCategoryService assetCategoryService) {
        this.assetCategoryService = assetCategoryService;
    }

    @GetMapping("/asset-categories")
    public ResponseEntity<List<AssetCategoryDto>> listCategories() {
        return ResponseEntity.ok(assetCategoryService.listCategories());
    }

    @GetMapping("/asset-categories/{categoryId}")
    public ResponseEntity<AssetCategoryDto> getCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(assetCategoryService.getCategory(categoryId));
    }

    @PostMapping("/asset-categories")
    public ResponseEntity<AssetCategoryDto> createCategory(
            @Valid @RequestBody AssetCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetCategoryService.createCategory(request));
    }

    @PutMapping("/asset-categories/{categoryId}")
    public ResponseEntity<AssetCategoryDto> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody AssetCategoryRequest request) {
        return ResponseEntity.ok(assetCategoryService.updateCategory(categoryId, request));
    }

    @PatchMapping("/asset-categories/{categoryId}/status")
    public ResponseEntity<AssetCategoryDto> updateStatus(
            @PathVariable Long categoryId,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(assetCategoryService.updateStatus(categoryId, request));
    }

    @GetMapping("/asset-categories/{categoryId}/fields")
    public ResponseEntity<List<CategoryCustomFieldDto>> listFields(@PathVariable Long categoryId) {
        return ResponseEntity.ok(assetCategoryService.listFields(categoryId));
    }

    @PostMapping("/asset-categories/{categoryId}/fields")
    public ResponseEntity<CategoryCustomFieldDto> createField(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryCustomFieldRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetCategoryService.createField(categoryId, request));
    }

    @PutMapping("/category-fields/{fieldId}")
    public ResponseEntity<CategoryCustomFieldDto> updateField(
            @PathVariable Long fieldId,
            @Valid @RequestBody CategoryCustomFieldRequest request) {
        return ResponseEntity.ok(assetCategoryService.updateField(fieldId, request));
    }

    @DeleteMapping("/category-fields/{fieldId}")
    public ResponseEntity<Void> deleteField(@PathVariable Long fieldId) {
        assetCategoryService.deleteField(fieldId);
        return ResponseEntity.noContent().build();
    }
}
