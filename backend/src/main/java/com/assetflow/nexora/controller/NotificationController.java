package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.NotificationDto;
import com.assetflow.nexora.service.NotificationService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notifications;

    public NotificationController(NotificationService notifications) {
        this.notifications = notifications;
    }

    @GetMapping
    public List<NotificationDto> list(Authentication authentication) {
        return notifications.listFor(authentication.getName());
    }

    @PatchMapping("/{notificationId}/read")
    public NotificationDto markRead(@PathVariable Long notificationId, Authentication authentication) {
        return notifications.markRead(notificationId, authentication.getName());
    }
}
