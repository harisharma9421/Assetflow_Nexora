package com.assetflow.nexora.scheduler;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OverdueReturnNotificationJob {
    private final JdbcTemplate jdbc;

    public OverdueReturnNotificationJob(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Scheduled(cron = "0 0 9 * * *")
    public void createDailyAlerts() {
        jdbc.update(
                "INSERT INTO notifications (user_id,type,title,message,related_entity_type,related_entity_id) SELECT holder_employee_id,CAST('Overdue Return Alert' AS notification_type),'Asset return overdue','An allocated asset is overdue for return.','allocation',allocation_id FROM v_overdue_allocations WHERE holder_employee_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id=v_overdue_allocations.holder_employee_id AND n.type=CAST('Overdue Return Alert' AS notification_type) AND n.related_entity_type='allocation' AND n.related_entity_id=v_overdue_allocations.allocation_id AND n.created_at::date=CURRENT_DATE)");
    }
}
