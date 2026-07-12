package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.ActivityLogResponse;
import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ActivityLogService {
    private final JdbcTemplate jdbc;

    public ActivityLogService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ActivityLogResponse> list(String action, String entityType, Long entityId, OffsetDateTime from,
            OffsetDateTime to) {
        StringBuilder sql = new StringBuilder(
                "SELECT l.log_id,l.user_id,COALESCE(u.full_name,'System') actor_name,l.action,l.entity_type,l.entity_id,l.details::text details,l.ip_address,l.created_at FROM activity_logs l LEFT JOIN users u ON u.user_id=l.user_id WHERE 1=1");
        List<Object> values = new ArrayList<>();
        add(sql, values, "l.action", action);
        add(sql, values, "l.entity_type", entityType);
        if (entityId != null) {
            sql.append(" AND l.entity_id=?");
            values.add(entityId);
        }
        if (from != null) {
            sql.append(" AND l.created_at>=?");
            values.add(from);
        }
        if (to != null) {
            sql.append(" AND l.created_at<=?");
            values.add(to);
        }
        sql.append(" ORDER BY l.created_at DESC");
        return jdbc.query(sql.toString(),
                (r, n) -> new ActivityLogResponse(r.getLong("log_id"), nullableLong(r, "user_id"),
                        r.getString("actor_name"), r.getString("action"), r.getString("entity_type"),
                        r.getLong("entity_id"), r.getString("details"), r.getString("ip_address"),
                        r.getObject("created_at", OffsetDateTime.class)),
                values.toArray());
    }

    private void add(StringBuilder sql, List<Object> values, String column, String value) {
        if (value != null && !value.isBlank()) {
            sql.append(" AND ").append(column).append("=?");
            values.add(value);
        }
    }

    private Long nullableLong(java.sql.ResultSet r, String column) throws java.sql.SQLException {
        long value = r.getLong(column);
        return r.wasNull() ? null : value;
    }
}
