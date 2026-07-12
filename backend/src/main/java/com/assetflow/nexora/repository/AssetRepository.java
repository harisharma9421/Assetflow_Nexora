package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.Asset;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {
    Optional<Asset> findByAssetTag(String assetTag);

    Optional<Asset> findByQrCode(String qrCode);

    List<Asset> findByStatus(String status);

    List<Asset> findByCategoryId(Long categoryId);
}
