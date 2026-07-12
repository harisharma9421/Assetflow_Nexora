package com.assetflow.nexora.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "maintenance_attachments")
public class MaintenanceAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attachment_id")
    public Long id;
    @Column(name = "request_id", nullable = false)
    public Long requestId;
    @Column(name = "file_url", nullable = false, length = 500)
    public String fileUrl;
    @Column(name = "uploaded_by", nullable = false)
    public Long uploadedBy;
    @Column(name = "uploaded_at", nullable = false)
    public OffsetDateTime uploadedAt;

    @PrePersist
    void created() {
        if (uploadedAt == null)
            uploadedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
