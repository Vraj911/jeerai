package com.jeerai.backend.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AutomationRule {
    private String id;
    private String name;
    private String projectId;
    private RuleValue trigger;
    private List<RuleValue> conditions = new ArrayList<>();
    private RuleValue action;
    private boolean enabled;
    private Instant createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RuleValue {
        private String type;
        private String value;
    }
}
