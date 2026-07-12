package com.assetflow.nexora.service;

import com.assetflow.nexora.entity.ActivityLog;
import com.assetflow.nexora.repository.ActivityLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityLogService {
    private static final Logger logger = LoggerFactory.getLogger(ActivityLogService.class);
    
    private final ActivityLogRepository activityLogs;
    private final ObjectMapper objectMapper;

    public ActivityLogService(ActivityLogRepository activityLogs, ObjectMapper objectMapper) {
        this.activityLogs = activityLogs;
        this.objectMapper = objectMapper;
    }

    /**
     * Create an activity log entry. Uses REQUIRES_NEW propagation to ensure
     * logs are committed even if the main transaction rolls back.
     */
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

    /**
     * Create an activity log entry without details.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, Long entityId, Long userId) {
        log(action, entityType, entityId, userId, null);
    }
}
