package com.assetflow.nexora.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "asset_categories")
public class AssetCategory extends AuditedEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    public Long id;
    @Column(nullable = false, unique = true, length = 100)
    public String name;
    @Column(columnDefinition = "text")
    public String description;
    @Column(nullable = false, length = 20)
    public String status = "Active";
}
