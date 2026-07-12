package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.AssetAllocation;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetAllocationRepository extends JpaRepository<AssetAllocation, Long> {
    Optional<AssetAllocation> findByAssetIdAndStatus(Long assetId, String status);

    List<AssetAllocation> findByAssetIdOrderByAllocationDateDesc(Long assetId);

    List<AssetAllocation> findByHolderEmployeeIdAndStatus(Long employeeId, String status);
}
