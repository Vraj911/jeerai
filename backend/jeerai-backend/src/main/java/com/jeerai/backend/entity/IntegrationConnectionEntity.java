package com.jeerai.backend.entity;

import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "integration_connections")
public class IntegrationConnectionEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "public_id", nullable = false, unique = true)
    private String publicId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private WorkspaceEntity workspace;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private ProjectEntity project;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false)
    private String status;

    @Column(name = "external_workspace_id")
    private String externalWorkspaceId;

    @Column(name = "external_workspace_name")
    private String externalWorkspaceName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "connected_by_user_id", nullable = false)
    private UserEntity connectedByUser;

    @Column(name = "last_error", columnDefinition = "text")
    private String lastError;

    @Column(name = "connected_at")
    private Instant connectedAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
