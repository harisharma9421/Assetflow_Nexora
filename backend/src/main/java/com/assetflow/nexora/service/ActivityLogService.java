package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.ActivityLogResponse;
import com.assetflow.nexora.entity.ActivityLog;
import com.assetflow.nexora.repository.ActivityLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityLogService {
    private static final Logger logger = LoggerFactory.getLogger(ActivityLogService.class);

    private final ActivityLogRepository activityLogs;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbc;

    public ActivityLogService(ActivityLogRepository activityLogs, ObjectMapper objectMapper, JdbcTemplate jdbc) {
        this.activityLogs = activityLogs;
        this.objectMapper = objectMapper;
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
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

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, Long entityId, Long userId, Map<String, Object> details) {
        try {
            ActivityLog log = new ActivityLog();
            log.action = action;
            log.entityType = entityType;
            log.entityId = entityId;
            log.userId = userId;
            log.details = details != null ? objectMapper.writeValueAsString(details) : null;
            log.createdAt = OffsetDateTime.now(ZoneOffset.UTC);

            activityLogs.save(log);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize activity log details", e);
        } catch (Exception e) {
            logger.error("Failed to create activity log", e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, Long entityId, Long userId) {
        log(action, entityType, entityId, userId, null);
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
