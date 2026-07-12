package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.AssetAllocation;
import java.time.LocalDate;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, Long> {
    Optional<AssetAllocation> findByAssetIdAndStatus(Long assetId, String status);

    List<AssetAllocation> findByAssetIdOrderByAllocationDateDesc(Long assetId);

    List<AssetAllocation> findByHolderEmployeeIdAndStatus(Long employeeId, String status);

    List<AssetAllocation> findByHolderDepartmentIdAndStatus(Long departmentId, String status);

    List<AssetAllocation> findByStatus(String status);

    List<AssetAllocation> findByStatusAndExpectedReturnDateBefore(String status, LocalDate date);
}
