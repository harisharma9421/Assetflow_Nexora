package com.assetflow.nexora.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "transfer_requests")
public class TransferRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transfer_id")
    public Long id;
    @Column(name = "asset_id", nullable = false)
    public Long assetId;
    @Column(name = "current_allocation_id", nullable = false)
    public Long currentAllocationId;
    @Column(name = "requested_by", nullable = false)
    public Long requestedBy;
    @Column(name = "requested_to_employee_id")
    public Long requestedToEmployeeId;
    @Column(name = "requested_to_department_id")
    public Long requestedToDepartmentId;
    @Column(columnDefinition = "text")
    public String reason;
    @Column(nullable = false, length = 20)
    public String status = "Requested";
    @Column(name = "approved_by")
    public Long approvedBy;
    @Column(name = "new_allocation_id")
    public Long newAllocationId;
    @Column(name = "requested_at", nullable = false)
    public OffsetDateTime requestedAt;
    @Column(name = "resolved_at")
    public OffsetDateTime resolvedAt;

    @PrePersist
    void created() {
        if (requestedAt == null)
            requestedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
