package com.jeerai.backend.service.automation;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;
import com.jeerai.backend.service.automation.AutomationEvent.IssueSnapshot;
import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.model.Issue;
@Component
public class AutomationConditionEvaluator {
    public boolean evaluate(List<AutomationRule.RuleValue> conditions, Issue issue) {
        IssueSnapshot snap = snapshotFromIssue(issue);
        if (conditions == null || conditions.isEmpty()) {
            return true;
        }
        for (AutomationRule.RuleValue c : conditions) {
            if (c == null || c.getType() == null) {
                continue;
            }
            if (!passes(c, snap)) {
                return false;
            }
        }
        return true;
    }
    private IssueSnapshot snapshotFromIssue(Issue issue) {
        List<String> labels = issue.getLabels() == null ? List.of() : issue.getLabels();
        String assigneeId = issue.getAssignee() == null ? null : issue.getAssignee().getId();
        return new IssueSnapshot(issue.getStatus(), issue.getPriority(), assigneeId, labels);
    }
    private boolean passes(AutomationRule.RuleValue condition, IssueSnapshot after) {
        String type = condition.getType().toLowerCase(Locale.ROOT);
        String value = condition.getValue();
        return switch (type) {
            case "status_is" -> after.status() != null && after.status().equalsIgnoreCase(value);
            case "priority_is" -> after.priority() != null && after.priority().equalsIgnoreCase(value);
            case "assignee_is" -> after.assigneeId() != null && after.assigneeId().equals(value);
            case "label_contains" -> after.labels() != null && after.labels().contains(value);
            default -> true;
        };
    }
}
