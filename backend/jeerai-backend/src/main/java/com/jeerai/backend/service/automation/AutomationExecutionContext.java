package com.jeerai.backend.service.automation;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
@Getter
public class AutomationExecutionContext {
    private final Set<String> executedRuleIds = new HashSet<>();
    private int depth;
    private final String originIssueId;
    private final int maxDepth;
    public AutomationExecutionContext(String originIssueId, int maxDepth) {
        this.originIssueId = originIssueId;
        this.maxDepth = maxDepth;
    }
    public void incrementDepth() {
        depth++;
    }
    public void decrementDepth() {
        depth--;
    }
}
