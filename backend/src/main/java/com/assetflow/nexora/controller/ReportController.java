package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.*;
import com.assetflow.nexora.service.ReportService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reports;

    public ReportController(ReportService reports) {
        this.reports = reports;
    }

    @GetMapping("/asset-utilization")
    public List<AssetUtilizationResponse> assetUtilization() {
        return reports.assetUtilization();
    }

    @GetMapping("/maintenance-frequency")
    public List<MaintenanceFrequencyResponse> maintenanceFrequency() {
        return reports.maintenanceFrequency();
    }

    @GetMapping("/department-allocation")
    public List<DepartmentAllocationResponse> departmentAllocation() {
        return reports.departmentAllocation();
    }

    @GetMapping("/booking-heatmap")
    public List<BookingHeatmapResponse> bookingHeatmap() {
        return reports.bookingHeatmap();
    }
}
