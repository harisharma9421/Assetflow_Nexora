package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.auth.AuthResponse;
import com.assetflow.nexora.dto.auth.AuthUserResponse;
import com.assetflow.nexora.dto.auth.ForgotPasswordRequest;
import com.assetflow.nexora.dto.auth.ForgotPasswordResponse;
import com.assetflow.nexora.dto.auth.LoginRequest;
import com.assetflow.nexora.dto.auth.PromoteUserRoleRequest;
import com.assetflow.nexora.dto.auth.ResetPasswordRequest;
import com.assetflow.nexora.dto.auth.SignupRequest;
import com.assetflow.nexora.entity.PasswordResetToken;
import com.assetflow.nexora.entity.Role;
import com.assetflow.nexora.entity.User;
import com.assetflow.nexora.exception.BadRequestException;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.exception.UnauthorizedException;
import com.assetflow.nexora.repository.RoleRepository;
import com.assetflow.nexora.repository.UserRepository;
import com.assetflow.nexora.repository.PasswordResetTokenRepository;
import com.assetflow.nexora.security.JwtService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String EMPLOYEE_ROLE = "Employee";
    private static final String ADMIN_ROLE = "Admin";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final long passwordResetExpirationMinutes;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            @Value("${app.password-reset.expiration-minutes}") long passwordResetExpirationMinutes) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.passwordResetExpirationMinutes = passwordResetExpirationMinutes;
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

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!"Active".equals(user.status) || !passwordEncoder.matches(request.password(), user.passwordHash)) {
            throw new UnauthorizedException("Invalid email or password");
        }

        Role role = roleRepository.findById(user.roleId)
                .orElseThrow(() -> new ResourceNotFoundException("User role is not configured"));

        user.lastLoginAt = OffsetDateTime.now(ZoneOffset.UTC);
        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser.id, savedUser.email, role.name);

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.getExpirationSeconds(),
                toAuthUserResponse(savedUser, role));
    }

    @Transactional(readOnly = true)
    public AuthUserResponse currentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user was not found"));
        Role role = roleRepository.findById(user.roleId)
                .orElseThrow(() -> new ResourceNotFoundException("User role is not configured"));
        return toAuthUserResponse(user, role);
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        return userRepository.findByEmail(normalizedEmail)
                .map(this::createPasswordResetToken)
                .orElseGet(() -> new ForgotPasswordResponse(
                        "If the email is registered, a reset token has been generated.",
                        null));
    }

    @Transactional
    public AuthUserResponse resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.token());
        PasswordResetToken resetToken = passwordResetTokenRepository.findFirstByTokenHashOrderByCreatedAtDesc(tokenHash)
                .orElseThrow(() -> new BadRequestException("Password reset token is invalid or expired"));

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (resetToken.usedAt != null || resetToken.expiresAt.isBefore(now)) {
            throw new BadRequestException("Password reset token is invalid or expired");
        }

        User user = userRepository.findById(resetToken.userId)
                .orElseThrow(() -> new ResourceNotFoundException("Password reset user was not found"));
        Role role = roleRepository.findById(user.roleId)
                .orElseThrow(() -> new ResourceNotFoundException("User role is not configured"));

        user.passwordHash = passwordEncoder.encode(request.newPassword());
        resetToken.usedAt = now;
        passwordResetTokenRepository.save(resetToken);
        User savedUser = userRepository.save(user);

        return toAuthUserResponse(savedUser, role);
    }

    @Transactional
    public AuthUserResponse promoteUserRole(
            Long userId,
            PromoteUserRoleRequest request,
            String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user was not found"));
        Role adminRole = roleRepository.findById(admin.roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin role is not configured"));

        if (!ADMIN_ROLE.equals(adminRole.name)) {
            throw new UnauthorizedException("Only Admin users can assign roles");
        }

        String requestedRoleName = request.roleName().trim();
        if (ADMIN_ROLE.equals(requestedRoleName)) {
            throw new BadRequestException("Admin role cannot be assigned through employee promotion");
        }

        Role requestedRole = roleRepository.findByName(requestedRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Requested role was not found"));
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User was not found"));

        targetUser.roleId = requestedRole.id;
        targetUser.promotedBy = admin.id;
        targetUser.promotedAt = OffsetDateTime.now(ZoneOffset.UTC);

        User savedUser = userRepository.save(targetUser);
        return toAuthUserResponse(savedUser, requestedRole);
    }

    private ForgotPasswordResponse createPasswordResetToken(User user) {
        String rawToken = generateRawToken();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.userId = user.id;
        resetToken.tokenHash = hashToken(rawToken);
        resetToken.expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(passwordResetExpirationMinutes);

        PasswordResetToken savedToken = passwordResetTokenRepository.save(resetToken);
        emailService.sendPasswordResetEmail(user.email, user.fullName, rawToken);
        return new ForgotPasswordResponse(
                "If the email is registered, a password reset email has been sent.",
                savedToken.expiresAt);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 hashing is not available", exception);
        }
    }

    public AuthUserResponse toAuthUserResponse(User user, Role role) {
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
