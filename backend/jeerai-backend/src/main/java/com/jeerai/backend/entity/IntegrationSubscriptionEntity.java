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
@Table(name = "integration_subscriptions")
public class IntegrationSubscriptionEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "connection_id", nullable = false)
    private IntegrationConnectionEntity connection;
    @Column(name = "channel_key", nullable = false)
    private String channelKey;
    @Column(name = "event_type", nullable = false)
    private String eventType;
    @Column(nullable = false)
    private boolean enabled;
    @Column(name = "created_at")
    private Instant createdAt;
}
