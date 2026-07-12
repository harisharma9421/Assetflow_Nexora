package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.AssetCustomFieldValue;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetCustomFieldValueRepository extends JpaRepository<AssetCustomFieldValue, Long> {
    List<AssetCustomFieldValue> findByAssetId(Long assetId);
}
