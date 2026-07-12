package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.ActivityLog;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByEntityTypeAndEntityId(String entityType, Long entityId);
}
