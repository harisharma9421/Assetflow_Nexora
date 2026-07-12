package com.assetflow.nexora.scheduler;

import com.assetflow.nexora.entity.Notification;
import com.assetflow.nexora.entity.ResourceBooking;
import com.assetflow.nexora.repository.NotificationRepository;
import com.assetflow.nexora.repository.ResourceBookingRepository;
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
public class BookingScheduler {
    private static final Logger logger = LoggerFactory.getLogger(BookingScheduler.class);
    private static final int REMINDER_HOURS_BEFORE = 1; // Send reminder 1 hour before booking

    private final ResourceBookingRepository bookings;
    private final NotificationRepository notifications;

    public BookingScheduler(ResourceBookingRepository bookings, NotificationRepository notifications) {
        this.bookings = bookings;
        this.notifications = notifications;
    }

    /**
     * Send booking reminders every 30 minutes for upcoming bookings.
     * Cron expression: 0 0/30 * * * ? (Every 30 minutes)
     */
    @Scheduled(cron = "0 0/30 * * * ?")
    @Transactional
    public void sendBookingReminders() {
        logger.info("Starting booking reminder check");
        
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime reminderWindow = now.plusHours(REMINDER_HOURS_BEFORE);
        
        // Find all upcoming bookings that start within the reminder window
        List<ResourceBooking> upcomingBookings = bookings.findAll().stream()
                .filter(b -> "Upcoming".equals(b.status))
                .filter(b -> b.startTime.isAfter(now) && b.startTime.isBefore(reminderWindow))
                .toList();
        
        int notificationCount = 0;
        for (ResourceBooking booking : upcomingBookings) {
            // Check if reminder already sent today
            LocalDate today = LocalDate.now();
            boolean reminderExists = notifications.findAll().stream()
                    .anyMatch(n -> n.userId.equals(booking.bookedBy)
                            && "Booking Reminder".equals(n.type)
                            && n.relatedEntityType != null && "booking".equals(n.relatedEntityType)
                            && booking.id.equals(n.relatedEntityId)
                            && n.createdAt.toLocalDate().equals(today));
            
            if (!reminderExists) {
                Notification notification = new Notification();
                notification.userId = booking.bookedBy;
                notification.type = "Booking Reminder";
                notification.title = "Upcoming Booking Reminder";
                notification.message = String.format(
                        "Your booking #%d starts at %s. Purpose: %s",
                        booking.id, 
                        booking.startTime, 
                        booking.purpose != null ? booking.purpose : "N/A");
                notification.relatedEntityType = "booking";
                notification.relatedEntityId = booking.id;
                notification.read = false;
                notification.createdAt = OffsetDateTime.now(ZoneOffset.UTC);
                
                notifications.save(notification);
                notificationCount++;
            }
        }
        
        logger.info("Booking reminder check completed. Found {} upcoming bookings, created {} reminders",
                upcomingBookings.size(), notificationCount);
    }

    /**
     * Auto-update booking status from Upcoming to Ongoing when start time is reached.
     * Auto-update booking status from Ongoing to Completed when end time is reached.
     * Runs every 5 minutes.
     * Cron expression: 0 0/5 * * * ? (Every 5 minutes)
     */
    @Scheduled(cron = "0 0/5 * * * ?")
    @Transactional
    public void updateBookingStatuses() {
        logger.info("Starting booking status update check");
        
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        
        // Find Upcoming bookings that should be Ongoing
        List<ResourceBooking> toStart = bookings.findAll().stream()
                .filter(b -> "Upcoming".equals(b.status))
                .filter(b -> b.startTime.isBefore(now) || b.startTime.isEqual(now))
                .toList();
        
        for (ResourceBooking booking : toStart) {
            booking.status = "Ongoing";
            bookings.save(booking);
        }
        
        // Find Ongoing bookings that should be Completed
        List<ResourceBooking> toComplete = bookings.findAll().stream()
                .filter(b -> "Ongoing".equals(b.status))
                .filter(b -> b.endTime.isBefore(now) || b.endTime.isEqual(now))
                .toList();
        
        for (ResourceBooking booking : toComplete) {
            booking.status = "Completed";
            bookings.save(booking);
        }
        
        logger.info("Booking status update completed. Started {} bookings, completed {} bookings",
                toStart.size(), toComplete.size());
    }
}
