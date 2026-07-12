package com.assetflow.nexora.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "asset_custom_field_values", uniqueConstraints = @UniqueConstraint(columnNames = { "asset_id",
        "field_id" }))
public class AssetCustomFieldValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "value_id")
    public Long id;
    @Column(name = "asset_id", nullable = false)
    public Long assetId;
    @Column(name = "field_id", nullable = false)
    public Long fieldId;
    @Column(name = "field_value", columnDefinition = "text")
    public String fieldValue;
}
