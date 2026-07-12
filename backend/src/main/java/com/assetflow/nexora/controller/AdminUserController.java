package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.auth.AuthUserResponse;
import com.assetflow.nexora.dto.auth.PromoteUserRoleRequest;
import com.assetflow.nexora.service.AuthService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AuthService authService;

    public AdminUserController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/{userId}/role")
    public ResponseEntity<AuthUserResponse> promoteUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody PromoteUserRoleRequest request,
            Principal principal) {
        return ResponseEntity.ok(authService.promoteUserRole(userId, request, principal.getName()));
    }
}
