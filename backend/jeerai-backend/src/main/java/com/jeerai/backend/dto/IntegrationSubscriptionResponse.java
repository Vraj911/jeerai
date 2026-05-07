package com.jeerai.backend.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationSubscriptionResponse {
    private String id;
    private String channelKey;
    private String eventType;
    private boolean enabled;
}
