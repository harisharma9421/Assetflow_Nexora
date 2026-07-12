package com.assetflow.nexora.dto; import java.time.*; public record UserResponse(Long id,String fullName,String email,Long departmentId,Short roleId,String status,OffsetDateTime lastLoginAt){}
