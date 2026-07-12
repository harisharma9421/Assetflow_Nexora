package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.DashboardKpiResponse;
import com.assetflow.nexora.dto.OverdueReturnResponse;
import java.sql.Date;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final JdbcTemplate jdbc;

    public DashboardService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public DashboardKpiResponse kpis() {
        Map<String, Object> row = jdbc.queryForMap("SELECT * FROM v_dashboard_kpis");
        return new DashboardKpiResponse(number(row, "assets_available"), number(row, "assets_allocated"),
                number(row, "maintenance_today"), number(row, "active_bookings"), number(row, "pending_transfers"),
                number(row, "upcoming_returns"));
    }

    public List<OverdueReturnResponse> overdueReturns() {
        return jdbc.query("SELECT * FROM v_overdue_allocations ORDER BY days_overdue DESC",
                (result, row) -> new OverdueReturnResponse(result.getLong("allocation_id"), result.getLong("asset_id"),
                        result.getString("asset_tag"), result.getString("asset_name"),
                        nullableLong(result, "holder_employee_id"), nullableLong(result, "holder_department_id"),
                        result.getObject("expected_return_date", Date.class).toLocalDate(),
                        result.getInt("days_overdue")));
    }

    private long number(Map<String, Object> row, String name) {
        return ((Number) row.get(name)).longValue();
    }

    private Long nullableLong(java.sql.ResultSet result, String name) throws java.sql.SQLException {
        long value = result.getLong(name);
        return result.wasNull() ? null : value;
    }
}
