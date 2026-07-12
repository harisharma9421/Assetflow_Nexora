package com.assetflow.nexora.dto; import java.time.*; public record ResourceBookingRequest(Long assetId,Long departmentId,String purpose,OffsetDateTime startTime,OffsetDateTime endTime){}
