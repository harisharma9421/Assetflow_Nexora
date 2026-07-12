package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.DashboardKpiResponse;
import com.assetflow.nexora.dto.OverdueReturnResponse;
import com.assetflow.nexora.service.DashboardService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboard;

    public DashboardController(DashboardService dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping("/kpis")
    public DashboardKpiResponse kpis() {
        return dashboard.kpis();
    }

    @GetMapping("/overdue-returns")
    public List<OverdueReturnResponse> overdueReturns() {
        return dashboard.overdueReturns();
    }
}
