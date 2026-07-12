package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.*;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReportService {
    private final JdbcTemplate jdbc;

    public ReportService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<AssetUtilizationResponse> assetUtilization() {
        return jdbc.query("SELECT * FROM v_asset_utilization ORDER BY times_allocated DESC, times_booked DESC",
                (r, n) -> new AssetUtilizationResponse(r.getLong("asset_id"), r.getString("asset_tag"),
                        r.getString("name"), r.getLong("times_allocated"), r.getLong("total_days_allocated"),
                        r.getLong("times_booked")));
    }

    public List<MaintenanceFrequencyResponse> maintenanceFrequency() {
        return jdbc.query("SELECT * FROM v_maintenance_frequency_by_category ORDER BY maintenance_count DESC",
                (r, n) -> new MaintenanceFrequencyResponse(r.getLong("category_id"), r.getString("category_name"),
                        r.getLong("maintenance_count")));
    }

    public List<DepartmentAllocationResponse> departmentAllocation() {
        return jdbc.query(
                "SELECT * FROM v_department_allocation_summary ORDER BY active_allocations DESC, department_name",
                (r, n) -> new DepartmentAllocationResponse(r.getLong("department_id"), r.getString("department_name"),
                        r.getLong("active_allocations")));
    }

    public List<BookingHeatmapResponse> bookingHeatmap() {
        return jdbc.query("SELECT * FROM v_booking_heatmap ORDER BY asset_id, day_of_week, hour_of_day",
                (r, n) -> new BookingHeatmapResponse(r.getLong("asset_id"), r.getInt("day_of_week"),
                        r.getInt("hour_of_day"), r.getLong("booking_count")));
    }
}
