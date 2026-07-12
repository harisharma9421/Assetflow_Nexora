package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.auth.AuthUserResponse;
import com.assetflow.nexora.dto.auth.SignupRequest;
import com.assetflow.nexora.entity.Role;
import com.assetflow.nexora.entity.User;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.RoleRepository;
import com.assetflow.nexora.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String EMPLOYEE_ROLE = "Employee";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthUserResponse signup(SignupRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        Role employeeRole = roleRepository.findByName(EMPLOYEE_ROLE)
                .orElseThrow(() -> new ResourceNotFoundException("Employee role is not configured"));

        User user = new User();
        user.fullName = request.fullName().trim();
        user.email = normalizedEmail;
        user.passwordHash = passwordEncoder.encode(request.password());
        user.departmentId = request.departmentId();
        user.roleId = employeeRole.id;
        user.status = "Active";

        User savedUser = userRepository.save(user);
        return toAuthUserResponse(savedUser, employeeRole);
    }

    private AuthUserResponse toAuthUserResponse(User user, Role role) {
        return new AuthUserResponse(
                user.id,
                user.fullName,
                user.email,
                user.departmentId,
                user.roleId,
                role.name,
                user.status);
    }
}
