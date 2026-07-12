package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.TransferRequest;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransferRequestRepository extends JpaRepository<TransferRequest, Long> {
    List<TransferRequest> findByAssetId(Long assetId);

    List<TransferRequest> findByStatus(String status);
}
