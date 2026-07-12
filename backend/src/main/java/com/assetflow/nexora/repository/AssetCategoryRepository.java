package com.assetflow.nexora.repository;

import com.assetflow.nexora.entity.AssetCategory;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {
    Optional<AssetCategory> findByName(String name);
}
