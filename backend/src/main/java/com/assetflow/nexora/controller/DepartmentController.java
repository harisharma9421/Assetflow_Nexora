package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.DepartmentDto;
import com.assetflow.nexora.dto.DepartmentRequest;
import com.assetflow.nexora.dto.StatusUpdateRequest;
import com.assetflow.nexora.service.DepartmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<List<DepartmentDto>> listDepartments() {
        return ResponseEntity.ok(departmentService.listDepartments());
    }

    @GetMapping("/{departmentId}")
    public ResponseEntity<DepartmentDto> getDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(departmentService.getDepartment(departmentId));
    }

    @PostMapping
    public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(departmentService.createDepartment(request));
    }

    @PutMapping("/{departmentId}")
    public ResponseEntity<DepartmentDto> updateDepartment(
            @PathVariable Long departmentId,
            @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(departmentService.updateDepartment(departmentId, request));
    }

    @PatchMapping("/{departmentId}/status")
    public ResponseEntity<DepartmentDto> updateStatus(
            @PathVariable Long departmentId,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(departmentService.updateStatus(departmentId, request));
    }
}
