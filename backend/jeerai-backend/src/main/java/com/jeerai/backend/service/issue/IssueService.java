package com.jeerai.backend.service.issue;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.jeerai.backend.service.automation.AutomationEvent;
import com.jeerai.backend.service.automation.AutomationEvent.EventOrigin;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeerai.backend.dto.AddCommentRequest;
import com.jeerai.backend.dto.IssueCreateRequest;
import com.jeerai.backend.model.Activity;
import com.jeerai.backend.model.AppNotification;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.IssueComment;
import com.jeerai.backend.model.Project;
import com.jeerai.backend.model.User;
import com.jeerai.backend.model.ProjectPermissionKey;
import com.jeerai.backend.model.WorkspaceRole;
import com.jeerai.backend.repository.activity.ActivityRepository;
import com.jeerai.backend.repository.issue.IssueRepository;
import com.jeerai.backend.repository.notification.NotificationRepository;
import com.jeerai.backend.repository.project.ProjectRepository;
import com.jeerai.backend.repository.user.UserRepository;
import com.jeerai.backend.security.CurrentUserProvider;
import com.jeerai.backend.service.exception.AccessDeniedException;
import com.jeerai.backend.service.exception.BadRequestException;
import com.jeerai.backend.service.exception.ResourceNotFoundException;
import com.jeerai.backend.service.workspace.WorkspaceAccessService;
import com.jeerai.backend.service.workspace.WorkspaceMemberService;
@Service
public class IssueService {
    private static final List<String> STATUS_FLOW = List.of("todo", "in-progress", "review", "done");
    private static final List<String> PRIORITY_FLOW = List.of("highest", "high", "medium", "low", "lowest");
    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;
    private final WorkspaceAccessService workspaceAccessService;
    private final WorkspaceMemberService workspaceMemberService;
    private final CurrentUserProvider currentUserProvider;
    private final ApplicationEventPublisher applicationEventPublisher;
    public IssueService(
            IssueRepository issueRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            ActivityRepository activityRepository,
            NotificationRepository notificationRepository,
            ObjectMapper objectMapper,
            WorkspaceAccessService workspaceAccessService,
            WorkspaceMemberService workspaceMemberService,
            CurrentUserProvider currentUserProvider,
            ApplicationEventPublisher applicationEventPublisher) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
        this.notificationRepository = notificationRepository;
        this.objectMapper = objectMapper;
        this.workspaceAccessService = workspaceAccessService;
        this.workspaceMemberService = workspaceMemberService;
        this.currentUserProvider = currentUserProvider;
        this.applicationEventPublisher = applicationEventPublisher;
    }
    public List<Issue> getAll(String projectId) {
        if (projectId != null) {
            workspaceAccessService.requireProjectReadAccess(projectId);
            return issueRepository.findByProjectId(projectId);
        }
        var accessibleWorkspaceIds = workspaceAccessService.getAccessibleWorkspaceIds();
        return issueRepository.findAll().stream()
                .filter(issue -> issue.getProjectId() != null)
                .filter(issue -> projectRepository.findById(issue.getProjectId())
                        .map(project -> project.getWorkspaceId() != null
                                && accessibleWorkspaceIds.contains(project.getWorkspaceId()))
                        .orElse(false))
                .toList();
    }
    public Issue getById(String id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));
        workspaceAccessService.requireProjectReadAccess(issue.getProjectId());
        return issue;
    }
    @Transactional
    public Issue create(IssueCreateRequest data) {
        if (data.getProjectId() == null || data.getProjectId().isBlank()) {
            throw new BadRequestException("projectId is required to create an issue");
        }
        String projectId = data.getProjectId();
        if (!workspaceAccessService.canCurrentUser(projectId, ProjectPermissionKey.CREATE_ISSUES)) {
            throw new AccessDeniedException("You do not have permission to create issues in this project");
        }
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        long existing = issueRepository.findByProjectId(projectId).size();
        String issueId = "issue-" + System.currentTimeMillis();
        User reporter = getCurrentActor();
        Issue issue = new Issue(
                issueId,
                project.getKey() + "-" + (100 + existing + 1),
                data.getTitle() == null ? "" : data.getTitle(),
                data.getStatus() == null ? "todo" : data.getStatus(),
                data.getPriority() == null ? "medium" : data.getPriority(),
                data.getAssignee(),
                reporter,
                Instant.now(),
                Instant.now(),
                data.getDescription() == null ? "" : data.getDescription(),
                data.getLabels() == null ? new ArrayList<>() : data.getLabels(),
                projectId,
                data.getSprintId());
        Issue saved = issueRepository.save(issue);
        createActivity("issue_created", reporter, saved, "Created " + saved.getKey());
        if (saved.getAssignee() != null
                && !Objects.equals(saved.getAssignee().getId(), reporter.getId())) {
            createNotification(
                    saved.getAssignee(),
                    "assignment",
                    "You were assigned to " + saved.getKey(),
                    saved.getTitle(),
                    saved);
        }
        Instant now = Instant.now();
        AutomationEvent.IssueSnapshot afterSnap = snapshot(saved);
        applicationEventPublisher.publishEvent(new AutomationEvent(
                this, "issue_created", projectId, saved.getId(), reporter.getId(),
                null, afterSnap, now, EventOrigin.USER));
        return saved;
    }
    @Transactional
    public Issue update(String id, JsonNode data) {
        Issue issue = getById(id);
        if (!workspaceAccessService.canCurrentUser(issue.getProjectId(), ProjectPermissionKey.EDIT_ISSUES)) {
            throw new AccessDeniedException("You do not have permission to edit issues in this project");
        }
        User actor = getCurrentActor();
        AutomationEvent.IssueSnapshot beforeSnap = snapshot(issue);
        String beforeStatus = issue.getStatus();
        String beforePriority = issue.getPriority();
        String beforeAssigneeId = issue.getAssignee() == null ? null : issue.getAssignee().getId();
        if (data.has("title")) issue.setTitle(readNullableString(data, "title"));
        if (data.has("status")) issue.setStatus(readNullableString(data, "status"));
        if (data.has("priority")) issue.setPriority(readNullableString(data, "priority"));
        if (data.has("assignee")) issue.setAssignee(readNullableObject(data.get("assignee"), User.class));
        if (data.has("reporter")) issue.setReporter(readNullableObject(data.get("reporter"), User.class));
        if (data.has("description")) issue.setDescription(readNullableString(data, "description"));
        if (data.has("labels")) issue.setLabels(readNullableList(data.get("labels")));
        if (data.has("projectId")) issue.setProjectId(readNullableString(data, "projectId"));
        if (data.has("sprintId")) issue.setSprintId(readNullableString(data, "sprintId"));
        issue.setUpdatedAt(Instant.now());
        Issue saved = issueRepository.save(issue);
        Instant now = Instant.now();
        String actorId = actor.getId();
        AutomationEvent.IssueSnapshot afterSnap = snapshot(saved);
        if (data.has("status") && !Objects.equals(beforeStatus, saved.getStatus())) {
            applicationEventPublisher.publishEvent(new AutomationEvent(
                    this, "status_change", saved.getProjectId(), saved.getId(),
                    actorId, beforeSnap, afterSnap, now, EventOrigin.USER));
        }
        if (data.has("priority") && !Objects.equals(beforePriority, saved.getPriority())) {
            applicationEventPublisher.publishEvent(new AutomationEvent(
                    this, "priority_change", saved.getProjectId(), saved.getId(),
                    actorId, beforeSnap, afterSnap, now, EventOrigin.USER));
        }
        if (data.has("assignee")) {
            String afterAssigneeId = saved.getAssignee() == null ? null : saved.getAssignee().getId();
            if (!Objects.equals(beforeAssigneeId, afterAssigneeId)) {
                applicationEventPublisher.publishEvent(new AutomationEvent(
                        this, "assignee_change", saved.getProjectId(), saved.getId(),
                        actorId, beforeSnap, afterSnap, now, EventOrigin.USER));
            }
        }
        if (data.has("status") && !Objects.equals(beforeStatus, saved.getStatus())) {
            createActivity("status_changed", actor, saved, "Updated status on " + saved.getKey());
            notifyAssigneeAndReporter(saved, actor,
                    "status_change",
                    saved.getKey() + " moved to " + humanize(saved.getStatus()),
                    saved.getTitle());
        }
        if (data.has("priority") && !Objects.equals(beforePriority, saved.getPriority())) {
            createActivity("priority_changed", actor, saved, "Updated priority on " + saved.getKey());
        }
        if (data.has("assignee")) {
            String afterAssigneeId = saved.getAssignee() == null ? null : saved.getAssignee().getId();
            if (!Objects.equals(beforeAssigneeId, afterAssigneeId)
                    && saved.getAssignee() != null
                    && !Objects.equals(saved.getAssignee().getId(), actor.getId())) {
                createActivity("assigned", actor, saved, "Reassigned " + saved.getKey());
                createNotification(
                        saved.getAssignee(),
                        "assignment",
                        "You were assigned to " + saved.getKey(),
                        saved.getTitle(),
                        saved);
            }
        }
        return saved;
    }
    @Transactional
    public Issue updateStatus(String id, String status) {
        Issue issue = getById(id);
        if (!workspaceAccessService.canCurrentUser(issue.getProjectId(), ProjectPermissionKey.EDIT_ISSUES)) {
            throw new AccessDeniedException("You do not have permission to edit issues in this project");
        }
        User actor = getCurrentActor();
        AutomationEvent.IssueSnapshot beforeSnap = snapshot(issue);
        String beforeStatus = issue.getStatus();
        issue.setStatus(status);
        issue.setUpdatedAt(Instant.now());
        Issue saved = issueRepository.save(issue);
        Instant now = Instant.now();
        AutomationEvent.IssueSnapshot afterSnap = snapshot(saved);
        if (!Objects.equals(beforeStatus, saved.getStatus())) {
            applicationEventPublisher.publishEvent(new AutomationEvent(
                    this, "status_change", saved.getProjectId(), saved.getId(),
                    actor.getId(), beforeSnap, afterSnap, now, EventOrigin.USER));
            createActivity("status_changed", actor, saved, "Updated status on " + saved.getKey());
            notifyAssigneeAndReporter(saved, actor,
                    "status_change",
                    saved.getKey() + " moved to " + humanize(saved.getStatus()),
                    saved.getTitle());
        }

        return saved;
    }
    public List<IssueComment> getComments(String issueId) {
        getById(issueId);
        return issueRepository.findCommentsByIssueId(issueId);
    }
    // FIX: added @Transactional — comment save + activity save must be atomic
    @Transactional
    public IssueComment addComment(String issueId, AddCommentRequest request) {
        Issue issue = getById(issueId);
        if (!workspaceAccessService.canCurrentUser(issue.getProjectId(), ProjectPermissionKey.EDIT_ISSUES)) {
            throw new AccessDeniedException("You do not have permission to comment on issues in this project");
        }
        User author = getCurrentActor();
        IssueComment comment = new IssueComment(
                "comment-" + System.currentTimeMillis(),
                issueId,
                author,
                request.getContent(),
                Instant.now());
        IssueComment saved = issueRepository.saveComment(comment);
        createActivity("commented", author, issue, "Commented on " + issue.getKey());
        notifyAssigneeAndReporter(issue, author,
                "comment",
                author.getName() + " commented on " + issue.getKey(),
                request.getContent());

        return saved;
    }
    @Transactional
    public Issue simulateRandomUpdate(Double randomValue) {
        List<Issue> writableIssues = issueRepository.findAll().stream()
                .filter(issue -> issue.getProjectId() != null && !issue.getProjectId().isBlank())
                .filter(issue -> projectRepository.findById(issue.getProjectId())
                        .map(project -> {
                            String workspaceId = project.getWorkspaceId();
                            if (workspaceId == null || workspaceId.isBlank()) {
                                return false;
                            }
                            return workspaceMemberService.getMembershipsForCurrentUser().stream()
                                    .anyMatch(membership -> workspaceId.equals(membership.getWorkspaceId())
                                            && membership.getRole() != WorkspaceRole.VIEWER);
                        })
                        .orElse(false))
                .toList();
        if (writableIssues.isEmpty()) {
            return null;
        }
        double r = randomValue == null ? Math.random() : randomValue;
        int issueIndex = Math.floorMod((int) Math.floor(r * writableIssues.size()), writableIssues.size());
        Issue issue = writableIssues.get(issueIndex);
        workspaceAccessService.requireProjectIssueWriteAccess(issue.getProjectId());
        if (!workspaceAccessService.canCurrentUser(issue.getProjectId(), ProjectPermissionKey.EDIT_ISSUES)) {
            throw new AccessDeniedException("You do not have permission to edit issues in this project");
        }
        int statusIndex = STATUS_FLOW.indexOf(issue.getStatus());
        int priorityIndex = PRIORITY_FLOW.indexOf(issue.getPriority());
        boolean flipPriority = r > 0.6;
        String nextStatus = STATUS_FLOW.get((statusIndex + 1 + STATUS_FLOW.size()) % STATUS_FLOW.size());
        String nextPriority = PRIORITY_FLOW.get((priorityIndex + 1 + PRIORITY_FLOW.size()) % PRIORITY_FLOW.size());
        AutomationEvent.IssueSnapshot beforeSnap = snapshot(issue);
        issue.setStatus(flipPriority ? issue.getStatus() : nextStatus);
        issue.setPriority(flipPriority ? nextPriority : issue.getPriority());
        issue.setUpdatedAt(Instant.now());
        Issue saved = issueRepository.save(issue);
        Instant now = Instant.now();
        AutomationEvent.IssueSnapshot afterSnap = snapshot(saved);
        User actor = getCurrentActor();
        if (!Objects.equals(beforeSnap.status(), afterSnap.status())) {
            applicationEventPublisher.publishEvent(new AutomationEvent(
                    this, "status_change", saved.getProjectId(), saved.getId(),
                    actor.getId(), beforeSnap, afterSnap, now, EventOrigin.USER));
        }
        if (!Objects.equals(beforeSnap.priority(), afterSnap.priority())) {
            applicationEventPublisher.publishEvent(new AutomationEvent(
                    this, "priority_change", saved.getProjectId(), saved.getId(),
                    actor.getId(), beforeSnap, afterSnap, now, EventOrigin.USER));
        }

        return saved;
    }
    // Private helpers
    private AutomationEvent.IssueSnapshot snapshot(Issue issue) {
        List<String> labels = issue.getLabels() == null ? List.of() : new ArrayList<>(issue.getLabels());
        String assigneeId = issue.getAssignee() == null ? null : issue.getAssignee().getId();
        return new AutomationEvent.IssueSnapshot(issue.getStatus(), issue.getPriority(), assigneeId, labels);
    }
    private User getCurrentActor() {
        return userRepository.findById(currentUserProvider.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
    private void createActivity(String type, User actor, Issue issue, String detail) {
        Activity activity = new Activity(
                "act-" + UUID.randomUUID(),
                type,
                actor,
                issue.getId(),
                issue.getKey(),
                issue.getTitle(),
                detail,
                Instant.now(),
                issue.getProjectId());
        activityRepository.save(activity);
    }
    private void notifyAssigneeAndReporter(Issue issue, User actor, String type, String title, String description) {
        String actorId = actor == null ? null : actor.getId();
        User assignee = issue.getAssignee();
        if (assignee != null && !Objects.equals(assignee.getId(), actorId)) {
            createNotification(assignee, type, title, description, issue);
        }
        User reporter = issue.getReporter();
        if (reporter != null
                && !Objects.equals(reporter.getId(), actorId)
                && (assignee == null || !Objects.equals(reporter.getId(), assignee.getId()))) {
            createNotification(reporter, type, title, description, issue);
        }
    }
    private void createNotification(User recipient, String type, String title, String description, Issue issue) {
        if (recipient == null || recipient.getId() == null) {
            return;
        }
        AppNotification notification = new AppNotification(
                "notif-" + UUID.randomUUID(),
                recipient.getId(),
                title,
                description,
                false,
                Instant.now(),
                issue == null ? null : issue.getId(),
                type);
        notificationRepository.save(notification);
    }
    private String humanize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String normalized = value.trim().replace('_', '-');
        String[] parts = normalized.split("-+");
        StringBuilder out = new StringBuilder();
        for (String part : parts) {
            if (part.isBlank()) continue;
            if (out.length() > 0) out.append(' ');
            out.append(Character.toUpperCase(part.charAt(0)));
            if (part.length() > 1) out.append(part.substring(1));
        }
        return out.toString();
    }
    private String readNullableString(JsonNode node, String key) {
        JsonNode value = node.get(key);
        return value == null || value.isNull() ? null : value.asText();
    }
    private <T> T readNullableObject(JsonNode node, Class<T> type) {
        if (node == null || node.isNull()) {
            return null;
        }
        return objectMapper.convertValue(node, type);
    }
    private List<String> readNullableList(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        return objectMapper.convertValue(node, new TypeReference<List<String>>() {});
    }
}