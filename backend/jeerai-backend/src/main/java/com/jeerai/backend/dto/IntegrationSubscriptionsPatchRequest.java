package com.jeerai.backend.dto;
import java.util.List;
import lombok.Data;
@Data
public class IntegrationSubscriptionsPatchRequest {
    private List<Item> subscriptions;
    @Data
    public static class Item {
        private String channelKey;
        private String eventType;
        private boolean enabled;
    }
}
