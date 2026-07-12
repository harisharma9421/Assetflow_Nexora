package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.AssetResponse;
import com.assetflow.nexora.dto.ResourceBookingResponse;
import com.assetflow.nexora.service.ResourceService;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {
    private final ResourceService resources;

    public ResourceController(ResourceService resources) {
        this.resources = resources;
    }

    @GetMapping
    public List<AssetResponse> listBookableResources(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {
        return resources.listBookableResources(categoryId, location, status);
    }

    @GetMapping("/{assetId}/bookings")
    public List<ResourceBookingResponse> getResourceBookings(
            @PathVariable Long assetId,
            @RequestParam(required = false) OffsetDateTime from,
            @RequestParam(required = false) OffsetDateTime to) {
        return resources.getResourceBookings(assetId, from, to);
    }
}
