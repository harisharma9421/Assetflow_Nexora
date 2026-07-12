package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.DepartmentDto;
import com.assetflow.nexora.dto.DepartmentRequest;
import com.assetflow.nexora.dto.StatusUpdateRequest;
import com.assetflow.nexora.entity.Department;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.DepartmentRepository;
import com.assetflow.nexora.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public DepartmentService(DepartmentRepository departmentRepository, UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> listDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartment(Long departmentId) {
        return toDto(findDepartment(departmentId));
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentRequest request) {
        validateUniqueName(request.name(), null);
        validateReferences(null, request.parentDepartmentId(), request.headUserId());

        Department department = new Department();
        applyRequest(department, request);
        return toDto(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentDto updateDepartment(Long departmentId, DepartmentRequest request) {
        Department department = findDepartment(departmentId);
        validateUniqueName(request.name(), departmentId);
        validateReferences(departmentId, request.parentDepartmentId(), request.headUserId());

        applyRequest(department, request);
        return toDto(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentDto updateStatus(Long departmentId, StatusUpdateRequest request) {
        Department department = findDepartment(departmentId);
        department.status = request.status();
        return toDto(departmentRepository.save(department));
    }

    private void applyRequest(Department department, DepartmentRequest request) {
        department.name = request.name().trim();
        department.parentDepartmentId = request.parentDepartmentId();
        department.headUserId = request.headUserId();
        department.status = request.status() == null ? "Active" : request.status();
    }

    private Department findDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department was not found"));
    }

    private void validateUniqueName(String name, Long currentDepartmentId) {
        departmentRepository.findByName(name.trim())
                .filter(existing -> !existing.id.equals(currentDepartmentId))
                .ifPresent(existing -> {
                    throw new BadRequestException("Department name is already in use");
                });
    }

    private void validateReferences(Long departmentId, Long parentDepartmentId, Long headUserId) {
        if (parentDepartmentId != null) {
            if (parentDepartmentId.equals(departmentId)) {
                throw new BadRequestException("Department cannot be its own parent");
            }
            if (!departmentRepository.existsById(parentDepartmentId)) {
                throw new ResourceNotFoundException("Parent department was not found");
            }
        }

        if (headUserId != null && !userRepository.existsById(headUserId)) {
            throw new ResourceNotFoundException("Department head user was not found");
        }
    }

    private DepartmentDto toDto(Department department) {
        return new DepartmentDto(
                department.id,
                department.name,
                department.parentDepartmentId,
                department.headUserId,
                department.status);
    }
}
