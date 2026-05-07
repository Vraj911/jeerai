package com.jeerai.backend.service.ai;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.jeerai.backend.service.ai.context.GenerateContext;
import com.jeerai.backend.service.ai.context.IssueSummary;
import com.jeerai.backend.service.ai.context.PriorityContext;
import com.jeerai.backend.service.ai.context.PriorityIssueSummary;
import com.jeerai.backend.service.ai.context.SummaryContext;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.Project;
import com.jeerai.backend.repository.activity.ActivityRepository;
import com.jeerai.backend.repository.issue.IssueRepository;
import com.jeerai.backend.repository.project.ProjectRepository;
import com.jeerai.backend.service.exception.BadRequestException;
import com.jeerai.backend.service.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class AiContextService {
    private static final List<String> OPEN_STATUSES = List.of("todo", "in-progress", "review");
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final ActivityRepository activityRepository;
    @Value("${app.ai.context.max-issues:50}")
    private int maxIssues;
    @Value("${app.ai.context.max-priority-issues:30}")
    private int maxPriorityIssues;
    public Object loadContext(String mode, String projectId) {
        return switch (mode) {
            case "generate" -> loadGenerateContext(projectId);
            case "summary" -> loadSummaryContext(projectId);
            case "priorities" -> loadPriorityContext(projectId);
            default -> throw new BadRequestException("Unknown AI mode: " + mode);
        };
    }
    private GenerateContext loadGenerateContext(String projectId) {
        Project p = loadProject(projectId);
        List<IssueSummary> issues = issueRepository.findByProjectId(projectId).stream()
                .filter(i -> isOpenStatus(i.getStatus()))
                .sorted(priorityThenUpdated())
                .limit(maxIssues)
                .map(this::toIssueSummary)
                .toList();
        return new GenerateContext(p.getName(), p.getKey(), p.getDescription(), issues);
    }
    private SummaryContext loadSummaryContext(String projectId) {
        Project p = loadProject(projectId);
        List<Issue> all = issueRepository.findByProjectId(projectId);
        Map<String, Long> byStatus = all.stream()
                .collect(Collectors.groupingBy(i -> i.getStatus() == null ? "unknown" : i.getStatus(), Collectors.counting()));
        Map<String, Long> byPriority = all.stream()
                .collect(Collectors.groupingBy(i -> i.getPriority() == null ? "unknown" : i.getPriority(), Collectors.counting()));
        long unassignedOpen = all.stream()
                .filter(i -> isOpenStatus(i.getStatus()))
                .filter(i -> i.getAssignee() == null)
                .count();
        Instant weekAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        long recentActivity = activityRepository.countByProjectIdAndCreatedAtAfter(projectId, weekAgo);
        List<IssueSummary> open = all.stream()
                .filter(i -> isOpenStatus(i.getStatus()))
                .sorted(priorityThenUpdated())
                .limit(maxIssues)
                .map(this::toIssueSummary)
                .toList();
        return new SummaryContext(p.getName(), new LinkedHashMap<>(byStatus), new LinkedHashMap<>(byPriority),
                unassignedOpen, recentActivity, open);
    }
    private PriorityContext loadPriorityContext(String projectId) {
        Project p = loadProject(projectId);
        List<PriorityIssueSummary> open = issueRepository.findByProjectId(projectId).stream()
                .filter(i -> isOpenForPriority(i.getStatus()))
                .sorted(Comparator.comparing(Issue::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(maxPriorityIssues)
                .map(this::toPriorityIssueSummary)
                .toList();
        return new PriorityContext(p.getName(), open);
    }
    private boolean isOpenForPriority(String status) {
        if (status == null) {
            return true;
        }
        String s = status.toLowerCase(Locale.ROOT);
        return !"done".equals(s) && !"cancelled".equals(s);
    }
    private PriorityIssueSummary toPriorityIssueSummary(Issue i) {
        String assignee = i.getAssignee() == null ? null : i.getAssignee().getName();
        String updated = i.getUpdatedAt() == null ? "" : i.getUpdatedAt().toString();
        List<String> labels = i.getLabels() == null ? List.of() : new ArrayList<>(i.getLabels());
        return new PriorityIssueSummary(
                i.getKey(),
                i.getTitle(),
                i.getStatus(),
                i.getPriority(),
                assignee,
                labels,
                updated);
    }
    private IssueSummary toIssueSummary(Issue i) {
        List<String> labels = i.getLabels() == null ? List.of() : new ArrayList<>(i.getLabels());
        return new IssueSummary(i.getKey(), i.getTitle(), i.getStatus(), i.getPriority(), labels);
    }
    private Comparator<Issue> priorityThenUpdated() {
        return Comparator.comparingInt(this::priorityIndex)
                .thenComparing(Issue::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
    }
    private int priorityIndex(Issue i) {
        if (i.getPriority() == null) {
            return 99;
        }
        int idx = List.of("highest", "high", "medium", "low", "lowest").indexOf(i.getPriority().toLowerCase(Locale.ROOT));
        return idx < 0 ? 99 : idx;
    }
    private boolean isOpenStatus(String status) {
        if (status == null) {
            return false;
        }
        return OPEN_STATUSES.contains(status.toLowerCase(Locale.ROOT));
    }
    private Project loadProject(String projectId) {
        return projectRepository.findById(Objects.requireNonNull(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }
}
