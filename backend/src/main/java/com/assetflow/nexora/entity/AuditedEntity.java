package com.assetflow.nexora.entity;
import jakarta.persistence.*; import java.time.*;
@MappedSuperclass public abstract class AuditedEntity { @Column(name="created_at",nullable=false,updatable=false) public OffsetDateTime createdAt; @Column(name="updated_at") public OffsetDateTime updatedAt; @PrePersist void created(){var now=OffsetDateTime.now(ZoneOffset.UTC);if(createdAt==null)createdAt=now;updatedAt=now;} @PreUpdate void updated(){updatedAt=OffsetDateTime.now(ZoneOffset.UTC);} }
