package com.assetflow.nexora.controller;

import com.assetflow.nexora.dto.*;
import com.assetflow.nexora.service.AllocationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/allocations")
public class AllocationController {
    private final AllocationService allocations;

    public AllocationController(AllocationService allocations) {
        this.allocations = allocations;
    }

    @PostMapping
    public ResponseEntity<AssetAllocationResponse> allocate(@Valid @RequestBody AssetAllocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(allocations.allocate(request));
    }

    @GetMapping
    public List<AssetAllocationResponse> list(@RequestParam(required = false) String status,
            @RequestParam(required = false) Long assetId, @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long departmentId, @RequestParam(required = false) Boolean overdue) {
        return allocations.list(status, assetId, employeeId, departmentId, overdue);
    }

    @GetMapping("/{allocationId}")
    public AssetAllocationResponse get(@PathVariable Long allocationId) {
        return allocations.get(allocationId);
    }

    @PostMapping("/{allocationId}/return")
    public AssetAllocationResponse returnAsset(@PathVariable Long allocationId,
            @Valid @RequestBody AssetReturnRequest request) {
        return allocations.returnAsset(allocationId, request);
    }

    @GetMapping("/overdue")
    public List<AssetAllocationResponse> getOverdueAllocations() {
        return allocations.listOverdue();
    }
}
