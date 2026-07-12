package com.assetflow.nexora.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "maintenance_requests")
public class MaintenanceRequest extends AuditedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    public Long id;
    @Column(name = "asset_id", nullable = false)
    public Long assetId;
    @Column(name = "raised_by", nullable = false)
    public Long raisedBy;
    @Column(name = "issue_description", nullable = false, columnDefinition = "text")
    public String issueDescription;
    @Column(nullable = false, length = 20)
    public String priority = "Medium";
    @Column(nullable = false, length = 30)
    public String status = "Pending";
    @Column(name = "approved_by")
    public Long approvedBy;
    @Column(name = "approved_at")
    public OffsetDateTime approvedAt;
    @Column(name = "rejection_reason", columnDefinition = "text")
    public String rejectionReason;
    @Column(name = "technician_name", length = 150)
    public String technicianName;
    @Column(name = "technician_assigned_at")
    public OffsetDateTime technicianAssignedAt;
    @Column(name = "resolved_at")
    public OffsetDateTime resolvedAt;
    @Column(name = "resolution_notes", columnDefinition = "text")
    public String resolutionNotes;
}
