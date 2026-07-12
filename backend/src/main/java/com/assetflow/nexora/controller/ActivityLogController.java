package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.ActivityLogResponse;
import com.assetflow.nexora.service.ActivityLogService;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLogController {
    private final ActivityLogService logs;

    public ActivityLogController(ActivityLogService logs) {
        this.logs = logs;
    }

    @GetMapping
    public List<ActivityLogResponse> list(@RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType, @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {
        return logs.list(action, entityType, entityId, from, to);
    }
}
