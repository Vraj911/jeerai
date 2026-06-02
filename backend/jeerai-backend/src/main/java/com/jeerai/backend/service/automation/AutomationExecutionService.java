package com.jeerai.backend.service.automation;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import com.jeerai.backend.model.AutomationRule;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.repository.automation.AutomationRuleRepository;
import com.jeerai.backend.repository.issue.IssueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class AutomationExecutionService {
    private static final ThreadLocal<AutomationExecutionContext> CONTEXT = new ThreadLocal<>();
    private final AutomationRuleRepository automationRuleRepository;
    private final IssueRepository issueRepository;
    private final AutomationConditionEvaluator conditionEvaluator;
    private final AutomationActionExecutor actionExecutor;
    @Value("${app.automation.max-depth:3}")
    private int maxDepth;
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onAutomationEvent(AutomationEvent event) {
        if (event.getOrigin() != AutomationEvent.EventOrigin.USER) {
            return;
        }
        AutomationExecutionContext ctx = CONTEXT.get();
        if (ctx == null) {
            ctx = new AutomationExecutionContext(event.getIssueId(), maxDepth);
            CONTEXT.set(ctx);
        }
        try {
            if (ctx.getDepth() >= ctx.getMaxDepth()) {
                log.warn("Automation max depth {} reached for issue {}, rule chain stopped",
                        ctx.getMaxDepth(), event.getIssueId());
                return;
            }
            ctx.incrementDepth();
            List<AutomationRule> rules = automationRuleRepository
                    .findByProjectId(event.getProjectId())
                    .stream()
                    .filter(AutomationRule::isEnabled)
                    .toList();
            for (AutomationRule rule : rules) {
                if (ctx.getExecutedRuleIds().contains(rule.getId())) {
                    log.debug("Automation rule '{}' already executed in this chain, skipping", rule.getId());
                    continue;
                }
                if (!triggerMatches(rule, event)) {
                    continue;
                }
                ctx.getExecutedRuleIds().add(rule.getId());
                Issue issue = issueRepository.findById(event.getIssueId()).orElse(null);
                if (issue == null) {
                    log.warn("Automation: issue {} not found, skipping rule '{}'",
                            event.getIssueId(), rule.getName());
                    continue;
                }
                try {
                    if (conditionEvaluator.evaluate(rule.getConditions(), issue)) {
                        log.info("Automation rule '{}' triggered by '{}' on issue '{}'",
                                rule.getName(), event.getEventType(), event.getIssueId());
                        actionExecutor.execute(rule, issue, event.getProjectId());
                    }
                } catch (Exception e) {
                    log.error("Automation rule '{}' failed on issue '{}': {}",
                            rule.getId(), event.getIssueId(), e.getMessage(), e);
                }
            }
        } finally {
            ctx.decrementDepth();
            if (ctx.getDepth() <= 0) {
                CONTEXT.remove();
            }
        }
    }
    private boolean triggerMatches(AutomationRule rule, AutomationEvent event) {
        if (rule.getTrigger() == null || rule.getTrigger().getType() == null) {
            return false;
        }
        String t = rule.getTrigger().getType();
        String v = rule.getTrigger().getValue();
        return switch (t) {
            case "issue_created" -> "issue_created".equals(event.getEventType());
            case "status_change" -> {
                if (!"status_change".equals(event.getEventType())) {
                    yield false;
                }
                yield v == null || v.isBlank()
                        || (event.getAfter() != null
                                && v.equalsIgnoreCase(event.getAfter().status()));
            }
            case "priority_change" -> {
                if (!"priority_change".equals(event.getEventType())) {
                    yield false;
                }
                yield v == null || v.isBlank()
                        || (event.getAfter() != null
                                && v.equalsIgnoreCase(event.getAfter().priority()));
            }
            case "assignee_change" -> {
                if (!"assignee_change".equals(event.getEventType())) {
                    yield false;
                }
                yield v == null || v.isBlank()
                        || (event.getAfter() != null
                                && v.equals(event.getAfter().assigneeId()));
            }
            default -> {
                log.warn("Unknown automation trigger type '{}' in rule '{}'", t, rule.getName());
                yield false;
            }
        };
    }
}