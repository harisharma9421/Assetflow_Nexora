package com.assetflow.nexora.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "discrepancy_reports")
public class DiscrepancyReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discrepancy_id")
    public Long id;
    @Column(name = "audit_cycle_id", nullable = false)
    public Long auditCycleId;
    @Column(name = "asset_id", nullable = false)
    public Long assetId;
    @Column(name = "issue_type", nullable = false, length = 20)
    public String issueType;
    @Column(columnDefinition = "text")
    public String description;
    @Column(name = "resolution_status", nullable = false, length = 20)
    public String resolutionStatus = "Open";
    @Column(name = "resolved_by")
    public Long resolvedBy;
    @Column(name = "resolved_at")
    public OffsetDateTime resolvedAt;
    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;

    @PrePersist
    void created() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
