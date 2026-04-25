package com.jeerai.backend.dto;
import com.jeerai.backend.model.AutomationRule;
import lombok.Data;
@Data
public class AutomationRuleCreateRequest {
    private String name;
    private String projectId;
    private AutomationRule.RuleValue trigger;
    private java.util.List<AutomationRule.RuleValue> conditions;
    private AutomationRule.RuleValue action;
    private boolean enabled;
}
