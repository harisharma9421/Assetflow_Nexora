package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.RoleDto;
import com.assetflow.nexora.dto.StatusUpdateRequest;
import com.assetflow.nexora.dto.UserResponse;
import com.assetflow.nexora.dto.UserUpdateRequest;
import com.assetflow.nexora.service.UserDirectoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserDirectoryController {

    private final UserDirectoryService userDirectoryService;

    public UserDirectoryController(UserDirectoryService userDirectoryService) {
        this.userDirectoryService = userDirectoryService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> listUsers(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(userDirectoryService.listUsers(departmentId, status));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userDirectoryService.getUser(userId));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userDirectoryService.updateUser(userId, request));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<UserResponse> updateStatus(
            @PathVariable Long userId,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(userDirectoryService.updateStatus(userId, request));
    }

    @GetMapping("/roles")
    public ResponseEntity<List<RoleDto>> listRoles() {
        return ResponseEntity.ok(userDirectoryService.listRoles());
    }
}
