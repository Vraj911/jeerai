package com.jeerai.backend.service;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.jeerai.backend.dto.AnalyticsDataDto;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.repository.IssueRepository;
import com.jeerai.backend.repository.SprintRepository;
@Service
public class AnalyticsService {
    private final IssueRepository issueRepository;
    private final SprintRepository sprintRepository;
    private final WorkspaceAccessService workspaceAccessService;
    public AnalyticsService(
            IssueRepository issueRepository,
            SprintRepository sprintRepository,
            WorkspaceAccessService workspaceAccessService) {
        this.issueRepository = issueRepository;
        this.sprintRepository = sprintRepository;
        this.workspaceAccessService = workspaceAccessService;
    }
    public AnalyticsDataDto getProjectAnalytics(String projectId) {
        workspaceAccessService.requireProjectReadAccess(projectId);
        List<Issue> projectIssues = issueRepository.findByProjectId(projectId);
        List<AnalyticsDataDto.StatusCount> statusCounts = List.of("todo", "in-progress", "review", "done").stream()
                .map(status -> new AnalyticsDataDto.StatusCount(
                        status,
                        (int) projectIssues.stream().filter(i -> status.equals(i.getStatus())).count()))
                .toList();
        Map<String, AnalyticsDataDto.WorkloadBucket> workload = new LinkedHashMap<>();
        for (Issue issue : projectIssues) {
            String assignee = issue.getAssignee() == null ? "Unassigned" : issue.getAssignee().getName();
            workload.putIfAbsent(assignee, new AnalyticsDataDto.WorkloadBucket(assignee, 0, 0, 0, 0));
            AnalyticsDataDto.WorkloadBucket bucket = workload.get(assignee);
            if ("todo".equals(issue.getStatus())) bucket.setTodo(bucket.getTodo() + 1);
            else if ("in-progress".equals(issue.getStatus())) bucket.setInProgress(bucket.getInProgress() + 1);
            else if ("review".equals(issue.getStatus())) bucket.setReview(bucket.getReview() + 1);
            else bucket.setDone(bucket.getDone() + 1);
        }
        List<AnalyticsDataDto.CompletionBucket> completionData = buildCompletionData(projectIssues);
        List<AnalyticsDataDto.VelocityBucket> velocityData = buildVelocityData(projectId, projectIssues);
        return new AnalyticsDataDto(
                statusCounts,
                completionData,
                velocityData,
                new ArrayList<>(workload.values()));
    }
    private List<AnalyticsDataDto.CompletionBucket> buildCompletionData(List<Issue> projectIssues) {
        List<Issue> doneIssues = projectIssues.stream()
                .filter(issue -> "done".equals(issue.getStatus()) && issue.getUpdatedAt() != null)
                .sorted(Comparator.comparing(Issue::getUpdatedAt))
                .toList();
        int totalDone = doneIssues.size();
        List<AnalyticsDataDto.CompletionBucket> completionData = new ArrayList<>();
        for (int index = 0; index < 4; index++) {
            int completed = totalDone == 0 ? 0 : (int) Math.ceil(((index + 1) / 4.0) * totalDone);
            completionData.add(new AnalyticsDataDto.CompletionBucket("Week " + (index + 1), completed));
        }
        return completionData;
    }
    private List<AnalyticsDataDto.VelocityBucket> buildVelocityData(String projectId, List<Issue> projectIssues) {
        Map<String, Long> completedBySprintId = projectIssues.stream()
                .filter(issue -> "done".equals(issue.getStatus()))
                .filter(issue -> issue.getSprintId() != null && !issue.getSprintId().isBlank())
                .collect(Collectors.groupingBy(Issue::getSprintId, LinkedHashMap::new, Collectors.counting()));

        return sprintRepository.findByProjectId(projectId).stream()
                .sorted(Comparator.comparing(sprint -> sprint.getStartDate() == null ? "" : sprint.getStartDate()))
                .map(sprint -> new AnalyticsDataDto.VelocityBucket(
                        sprint.getName(),
                        completedBySprintId.getOrDefault(sprint.getId(), 0L).intValue()))
                .toList();
    }
}
