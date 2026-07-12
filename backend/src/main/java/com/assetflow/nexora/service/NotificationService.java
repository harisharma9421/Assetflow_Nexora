package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.NotificationDto;
import com.assetflow.nexora.entity.User;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.UserRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationService {
    private final JdbcTemplate jdbc;
    private final UserRepository users;

    public NotificationService(JdbcTemplate jdbc, UserRepository users) {
        this.jdbc = jdbc;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> listFor(String email) {
        Long userId = user(email).id;
        return jdbc.query(
                "SELECT notification_id, user_id, type::text AS type, title, message, related_entity_type, related_entity_id, is_read, created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC",
                (r, n) -> new NotificationDto(r.getLong("notification_id"), r.getLong("user_id"), r.getString("type"),
                        r.getString("title"), r.getString("message"), r.getString("related_entity_type"),
                        nullableLong(r, "related_entity_id"), r.getBoolean("is_read"),
                        r.getObject("created_at", OffsetDateTime.class)),
                userId);
    }

    public NotificationDto markRead(Long notificationId, String email) {
        Long userId = user(email).id;
        int updated = jdbc.update("UPDATE notifications SET is_read=true WHERE notification_id=? AND user_id=?",
                notificationId, userId);
        if (updated == 0)
            throw new ResourceNotFoundException("Notification with id " + notificationId + " was not found");
        return jdbc.queryForObject(
                "SELECT notification_id, user_id, type::text AS type, title, message, related_entity_type, related_entity_id, is_read, created_at FROM notifications WHERE notification_id=?",
                (r, n) -> new NotificationDto(r.getLong("notification_id"), r.getLong("user_id"), r.getString("type"),
                        r.getString("title"), r.getString("message"), r.getString("related_entity_type"),
                        nullableLong(r, "related_entity_id"), r.getBoolean("is_read"),
                        r.getObject("created_at", OffsetDateTime.class)),
                notificationId);
    }

    private User user(String email) {
        return users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user was not found"));
    }

    private Long nullableLong(java.sql.ResultSet r, String column) throws java.sql.SQLException {
        long value = r.getLong(column);
        return r.wasNull() ? null : value;
    }
}
