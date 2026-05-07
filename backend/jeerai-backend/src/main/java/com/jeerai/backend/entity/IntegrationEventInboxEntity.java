package com.jeerai.backend.entity;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "integration_event_inbox")
public class IntegrationEventInboxEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;
    @Column(nullable = false)
    private String provider;
    @Column(name = "external_event_id", nullable = false)
    private String externalEventId;
    @Column(name = "payload_json", columnDefinition = "text")
    private String payloadJson;
    @Column(name = "signature_valid", nullable = false)
    private boolean signatureValid;
    @Column(name = "received_at")
    private Instant receivedAt;
    @Column(name = "processed_at")
    private Instant processedAt;
    @Column(nullable = false)
    private String status;
    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;
}
