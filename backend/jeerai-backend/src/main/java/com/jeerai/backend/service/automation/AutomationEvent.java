package com.jeerai.backend.service.automation;
import java.time.Instant;
import java.util.List;
import org.springframework.context.ApplicationEvent;
import lombok.Getter;
@Getter
public class AutomationEvent extends ApplicationEvent {
    private final String eventType;
    private final String projectId;
    private final String issueId;
    private final String actorUserId;
    private final IssueSnapshot before;
    private final IssueSnapshot after;
    private final Instant occurredAt;
    private final EventOrigin origin;
    public record IssueSnapshot(
            String status,
            String priority,
            String assigneeId,
            List<String> labels) {
    }
    public enum EventOrigin {
        USER, AUTOMATION
    }
    public AutomationEvent(
            Object source,
            String eventType,
            String projectId,
            String issueId,
            String actorUserId,
            IssueSnapshot before,
            IssueSnapshot after,
            Instant occurredAt,
            EventOrigin origin) {
        super(source);
        this.eventType = eventType;
        this.projectId = projectId;
        this.issueId = issueId;
        this.actorUserId = actorUserId;
        this.before = before;
        this.after = after;
        this.occurredAt = occurredAt;
        this.origin = origin;
    }
}
