package com.jeerai.backend.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeerai.backend.dto.AddCommentRequest;
import com.jeerai.backend.dto.IssueCreateRequest;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.model.IssueComment;
import com.jeerai.backend.model.Project;
import com.jeerai.backend.model.User;
import com.jeerai.backend.repository.IssueRepository;
import com.jeerai.backend.repository.ProjectRepository;
import com.jeerai.backend.repository.UserRepository;
import com.jeerai.backend.security.CurrentUserProvider;

@Service
public class IssueService {

    private static final List<String> STATUS_FLOW = List.of("todo", "in-progress", "review", "done");
    private static final List<String> PRIORITY_FLOW = List.of("highest", "high", "medium", "low", "lowest");

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final WorkspaceAccessService workspaceAccessService;
    private final CurrentUserProvider currentUserProvider;

    public IssueService(
            IssueRepository issueRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper,
            WorkspaceAccessService workspaceAccessService,
            CurrentUserProvider currentUserProvider) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.workspaceAccessService = workspaceAccessService;
        this.currentUserProvider = currentUserProvider;
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
                        .map(project -> project.getWorkspaceId() != null && accessibleWorkspaceIds.contains(project.getWorkspaceId()))
                        .orElse(false))
                .toList();
    }

    public Issue getById(String id) {
        Issue issue = issueRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Issue not found"));
        workspaceAccessService.requireProjectReadAccess(issue.getProjectId());
        return issue;
    }

    public Issue create(IssueCreateRequest data) {
        String projectId = data.getProjectId() == null ? "proj-1" : data.getProjectId();
        workspaceAccessService.requireProjectIssueWriteAccess(projectId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        long existing = issueRepository.findByProjectId(projectId).size();
        String issueId = "issue-" + System.currentTimeMillis();

        User reporter = userRepository.findById(currentUserProvider.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

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

        return issueRepository.save(issue);
    }

    public Issue update(String id, JsonNode data) {
        Issue issue = getById(id);
        workspaceAccessService.requireProjectIssueWriteAccess(issue.getProjectId());

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
        return issueRepository.save(issue);
    }

    public Issue updateStatus(String id, String status) {
        Issue issue = getById(id);
        workspaceAccessService.requireProjectIssueWriteAccess(issue.getProjectId());
        issue.setStatus(status);
        issue.setUpdatedAt(Instant.now());
        return issueRepository.save(issue);
    }

    public List<IssueComment> getComments(String issueId) {
        getById(issueId);
        return issueRepository.findCommentsByIssueId(issueId);
    }

    public IssueComment addComment(String issueId, AddCommentRequest request) {
        Issue issue = getById(issueId);
        workspaceAccessService.requireProjectIssueWriteAccess(issue.getProjectId());
        User author = userRepository.findById(currentUserProvider.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        IssueComment comment = new IssueComment(
                "comment-" + System.currentTimeMillis(),
                issueId,
                author,
                request.getContent(),
                Instant.now());

        return issueRepository.saveComment(comment);
    }

    public Issue simulateRandomUpdate(Double randomValue) {
        List<Issue> allIssues = issueRepository.findAll();
        if (allIssues.isEmpty()) {
            throw new ResourceNotFoundException("No issues found");
        }

        double r = randomValue == null ? Math.random() : randomValue;
        int issueIndex = Math.floorMod((int) Math.floor(r * allIssues.size()), allIssues.size());
        Issue issue = allIssues.get(issueIndex);
        workspaceAccessService.requireProjectIssueWriteAccess(issue.getProjectId());

        int statusIndex = STATUS_FLOW.indexOf(issue.getStatus());
        int priorityIndex = PRIORITY_FLOW.indexOf(issue.getPriority());
        boolean flipPriority = r > 0.6;

        String nextStatus = STATUS_FLOW.get((statusIndex + 1 + STATUS_FLOW.size()) % STATUS_FLOW.size());
        String nextPriority = PRIORITY_FLOW.get((priorityIndex + 1 + PRIORITY_FLOW.size()) % PRIORITY_FLOW.size());

        issue.setStatus(flipPriority ? issue.getStatus() : nextStatus);
        issue.setPriority(flipPriority ? nextPriority : issue.getPriority());
        issue.setUpdatedAt(Instant.now());
        return issueRepository.save(issue);
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
