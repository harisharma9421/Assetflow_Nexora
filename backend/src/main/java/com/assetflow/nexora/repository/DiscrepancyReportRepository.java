package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.DiscrepancyReport;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscrepancyReportRepository extends JpaRepository<DiscrepancyReport, Long> {
    List<DiscrepancyReport> findByAuditCycleId(Long auditCycleId);
}
