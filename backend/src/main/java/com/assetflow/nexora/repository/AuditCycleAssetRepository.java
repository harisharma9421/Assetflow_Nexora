package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.AuditCycleAsset;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditCycleAssetRepository extends JpaRepository<AuditCycleAsset, Long> {
    List<AuditCycleAsset> findByAuditCycleId(Long auditCycleId);
}
