package com.assetflow.nexora.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "audit_cycle_assets", uniqueConstraints = @UniqueConstraint(columnNames = { "audit_cycle_id",
        "asset_id" }))
public class AuditCycleAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_cycle_asset_id")
    public Long id;
    @Column(name = "audit_cycle_id", nullable = false)
    public Long auditCycleId;
    @Column(name = "asset_id", nullable = false)
    public Long assetId;
    @Column(name = "verification_status", nullable = false, length = 20)
    public String verificationStatus = "Pending";
    @Column(name = "verified_by")
    public Long verifiedBy;
    @Column(name = "verified_at")
    public OffsetDateTime verifiedAt;
    @Column(columnDefinition = "text")
    public String notes;
}
