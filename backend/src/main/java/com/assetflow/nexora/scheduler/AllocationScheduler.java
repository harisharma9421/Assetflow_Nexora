package com.assetflow.nexora.scheduler;

import com.assetflow.nexora.entity.AssetAllocation;
import com.assetflow.nexora.entity.Notification;
import com.assetflow.nexora.repository.AssetAllocationRepository;
import com.assetflow.nexora.repository.NotificationRepository;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AllocationScheduler {
    private static final Logger logger = LoggerFactory.getLogger(AllocationScheduler.class);

    private final AssetAllocationRepository allocations;
    private final NotificationRepository notifications;

    public AllocationScheduler(AssetAllocationRepository allocations, NotificationRepository notifications) {
        this.allocations = allocations;
        this.notifications = notifications;
    }

    /**
     * Check for overdue allocations daily at 9 AM and create notifications.
     * Cron expression: 0 0 9 * * ? (Every day at 9:00 AM)
     */
    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional
    public void detectOverdueAllocations() {
        logger.info("Starting overdue allocation detection");
        
        List<AssetAllocation> overdueAllocations = allocations.findByStatusAndExpectedReturnDateBefore(
                "Active", LocalDate.now());
        
        int notificationCount = 0;
        for (AssetAllocation allocation : overdueAllocations) {
            // Create notification for the holder if it's an employee
            if ("Employee".equals(allocation.holderType) && allocation.holderEmployeeId != null) {
                // Check if notification already exists for today
                LocalDate today = LocalDate.now();
                boolean notificationExists = notifications.findAll().stream()
                        .anyMatch(n -> n.userId.equals(allocation.holderEmployeeId) 
                                && "Overdue Return Alert".equals(n.type)
                                && n.relatedEntityType != null && "allocation".equals(n.relatedEntityType)
                                && allocation.id.equals(n.relatedEntityId)
                                && n.createdAt.toLocalDate().equals(today));
                
                if (!notificationExists) {
                    Notification notification = new Notification();
                    notification.userId = allocation.holderEmployeeId;
                    notification.type = "Overdue Return Alert";
                    notification.title = "Asset Return Overdue";
                    notification.message = String.format(
                            "Asset allocation #%d is overdue. Expected return date was %s. Please return the asset as soon as possible.",
                            allocation.id, allocation.expectedReturnDate);
                    notification.relatedEntityType = "allocation";
                    notification.relatedEntityId = allocation.id;
                    notification.read = false;
                    notification.createdAt = OffsetDateTime.now(ZoneOffset.UTC);
                    
                    notifications.save(notification);
                    notificationCount++;
                }
            }
            
            // Update allocation status to Overdue
            if (!"Overdue".equals(allocation.status)) {
                allocation.status = "Overdue";
                allocations.save(allocation);
            }
        }
        
        logger.info("Overdue allocation detection completed. Found {} overdue allocations, created {} notifications", 
                overdueAllocations.size(), notificationCount);
    }
}
