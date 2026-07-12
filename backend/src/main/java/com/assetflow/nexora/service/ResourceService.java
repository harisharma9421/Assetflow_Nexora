package com.assetflow.nexora.service;

import com.assetflow.nexora.dto.AssetResponse;
import com.assetflow.nexora.dto.ResourceBookingResponse;
import com.assetflow.nexora.entity.Asset;
import com.assetflow.nexora.entity.ResourceBooking;
import com.assetflow.nexora.exception.ResourceNotFoundException;
import com.assetflow.nexora.repository.AssetRepository;
import com.assetflow.nexora.repository.ResourceBookingRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ResourceService {
    private final AssetRepository assets;
    private final ResourceBookingRepository bookings;

    public ResourceService(AssetRepository assets, ResourceBookingRepository bookings) {
        this.assets = assets;
        this.bookings = bookings;
    }

    public List<AssetResponse> listBookableResources(Long categoryId, String location, String status) {
        Specification<Asset> spec = Specification.where(null);
        
        // Always filter for bookable assets
        spec = spec.and((root, query, builder) -> builder.isTrue(root.get("bookable")));
        
        if (categoryId != null) {
            spec = spec.and((root, query, builder) -> builder.equal(root.get("categoryId"), categoryId));
        }
        
        if (location != null && !location.isBlank()) {
            spec = spec.and((root, query, builder) -> 
                builder.equal(builder.lower(root.get("location")), location.toLowerCase()));
        }
        
        if (status != null && !status.isBlank()) {
            spec = spec.and((root, query, builder) -> builder.equal(root.get("status"), status));
        } else {
            // Default: only show Available and Reserved resources
            spec = spec.and((root, query, builder) -> 
                root.get("status").in("Available", "Reserved"));
        }
        
        return assets.findAll(spec).stream()
                .map(this::toAssetResponse)
                .toList();
    }

    public List<ResourceBookingResponse> getResourceBookings(Long assetId, OffsetDateTime from, OffsetDateTime to) {
        // Verify asset exists and is bookable
        Asset asset = assets.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset with id " + assetId + " was not found"));
        
        if (!asset.bookable) {
            throw new IllegalArgumentException("Asset is not bookable");
        }
        
        List<ResourceBooking> result = bookings.findByAssetId(assetId);
        
        // Filter by date range if provided
        if (from != null || to != null) {
            result = result.stream()
                    .filter(b -> {
                        if (from != null && b.endTime.isBefore(from)) return false;
                        if (to != null && b.startTime.isAfter(to)) return false;
                        return true;
                    })
                    .toList();
        }
        
        // Only show non-cancelled bookings
        result = result.stream()
                .filter(b -> !"Cancelled".equals(b.status))
                .toList();
        
        return result.stream()
                .map(this::toBookingResponse)
                .toList();
    }

    private AssetResponse toAssetResponse(Asset a) {
        return new AssetResponse(
            a.id, 
            a.assetTag, 
            a.name, 
            a.categoryId, 
            a.serialNumber, 
            a.qrCode, 
            a.condition, 
            a.location, 
            a.status, 
            a.bookable, 
            a.owningDepartmentId
        );
    }

    private ResourceBookingResponse toBookingResponse(ResourceBooking b) {
        return new ResourceBookingResponse(
            b.id,
            b.assetId,
            b.bookedBy,
            b.departmentId,
            b.purpose,
            b.startTime,
            b.endTime,
            b.status
        );
    }
}
