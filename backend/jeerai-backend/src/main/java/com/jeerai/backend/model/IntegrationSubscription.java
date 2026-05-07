package com.jeerai.backend.model;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationSubscription {
    private String id;
    private String connectionId;
    private String channelKey;
    private String eventType;
    private boolean enabled;
    private Instant createdAt;
}
