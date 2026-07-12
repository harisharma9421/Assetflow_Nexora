package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.RoleDto;
import com.assetflow.nexora.dto.StatusUpdateRequest;
import com.assetflow.nexora.dto.UserResponse;
import com.assetflow.nexora.dto.UserUpdateRequest;
import com.assetflow.nexora.entity.Role;
import com.assetflow.nexora.entity.User;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.DepartmentRepository;
import com.assetflow.nexora.repository.RoleRepository;
import com.assetflow.nexora.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDirectoryService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;

    public UserDirectoryService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers(Long departmentId, String status) {
        return userRepository.findAll().stream()
                .filter(user -> departmentId == null || departmentId.equals(user.departmentId))
                .filter(user -> status == null || status.equals(user.status))
                .map(this::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(Long userId) {
        return toUserResponse(findUser(userId));
    }

    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = findUser(userId);
        validateReferences(request.departmentId(), request.roleId());

        if (request.email() != null) {
            String normalizedEmail = request.email().trim().toLowerCase();
            userRepository.findByEmail(normalizedEmail)
                    .filter(existing -> !existing.id.equals(userId))
                    .ifPresent(existing -> {
                        throw new BadRequestException("Email is already registered");
                    });
            user.email = normalizedEmail;
        }

        user.fullName = request.fullName().trim();
        user.departmentId = request.departmentId();
        if (request.roleId() != null) {
            user.roleId = request.roleId();
        }
        if (request.status() != null) {
            user.status = request.status();
        }

        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateStatus(Long userId, StatusUpdateRequest request) {
        User user = findUser(userId);
        user.status = request.status();
        return toUserResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<RoleDto> listRoles() {
        return roleRepository.findAll().stream()
                .map(role -> new RoleDto(role.id, role.name))
                .toList();
    }

    private void validateReferences(Long departmentId, Short roleId) {
        if (departmentId != null && !departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department was not found");
        }
        if (roleId != null && !roleRepository.existsById(roleId)) {
            throw new ResourceNotFoundException("Role was not found");
        }
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User was not found"));
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.id,
                user.fullName,
                user.email,
                user.departmentId,
                user.roleId,
                user.status,
                user.lastLoginAt);
    }
}
