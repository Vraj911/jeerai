package com.jeerai.backend.model;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationSecret {
    private String id;
    private String connectionId;
    private IntegrationSecretType secretType;
    private String plainValue;
    private Instant createdAt;
    private Instant updatedAt;
}
