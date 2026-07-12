package com.assetflow.nexora.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "asset_allocations")
public class AssetAllocation extends AuditedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allocation_id")
    public Long id;
    @Column(name = "asset_id", nullable = false)
    public Long assetId;
    @Column(name = "holder_type", nullable = false, length = 20)
    public String holderType;
    @Column(name = "holder_employee_id")
    public Long holderEmployeeId;
    @Column(name = "holder_department_id")
    public Long holderDepartmentId;
    @Column(name = "allocated_by", nullable = false)
    public Long allocatedBy;
    @Column(name = "allocation_date", nullable = false)
    public LocalDate allocationDate;
    @Column(name = "expected_return_date")
    public LocalDate expectedReturnDate;
    @Column(name = "actual_return_date")
    public LocalDate actualReturnDate;
    @Column(name = "return_condition_notes", columnDefinition = "text")
    public String returnConditionNotes;
    @Column(name = "returned_to")
    public Long returnedTo;
    @Column(nullable = false, length = 20)
    public String status = "Active";

    @PrePersist
    void date() {
        if (allocationDate == null)
            allocationDate = LocalDate.now();
    }
}
