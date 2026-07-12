package com.assetflow.nexora.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "audit_cycles")
public class AuditCycle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_cycle_id")
    public Long id;
    @Column(nullable = false, length = 150)
    public String name;
    @Column(name = "scope_department_id")
    public Long scopeDepartmentId;
    @Column(name = "scope_location", length = 150)
    public String scopeLocation;
    @Column(name = "start_date", nullable = false)
    public LocalDate startDate;
    @Column(name = "end_date", nullable = false)
    public LocalDate endDate;
    @Column(nullable = false, length = 20)
    public String status = "Planned";
    @Column(name = "created_by", nullable = false)
    public Long createdBy;
    @Column(name = "closed_by")
    public Long closedBy;
    @Column(name = "closed_at")
    public OffsetDateTime closedAt;
    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @PrePersist
    void created() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
