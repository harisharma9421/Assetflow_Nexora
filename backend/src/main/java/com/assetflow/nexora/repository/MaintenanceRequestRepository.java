package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.MaintenanceRequest;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByAssetId(Long assetId);

    List<MaintenanceRequest> findByStatus(String status);
}
