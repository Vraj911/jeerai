package com.jeerai.backend.dto;

import java.util.List;

import com.jeerai.backend.model.AutomationRule;

import lombok.Data;

@Data
public class AutomationRuleUpdateRequest {
    private String name;
    private String projectId;
    private AutomationRule.RuleValue trigger;
    private List<AutomationRule.RuleValue> conditions;
    private AutomationRule.RuleValue action;
    private Boolean enabled;
}
