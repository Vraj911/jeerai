package com.jeerai.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.jeerai.backend.dto.AnalyticsDataDto;
import com.jeerai.backend.model.Issue;
import com.jeerai.backend.repository.IssueRepository;

@Service
public class AnalyticsService {

    private final IssueRepository issueRepository;
    private final WorkspaceAccessService workspaceAccessService;

    public AnalyticsService(IssueRepository issueRepository, WorkspaceAccessService workspaceAccessService) {
        this.issueRepository = issueRepository;
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

        Map<String, AnalyticsDataDto.WorkloadBucket> workload = new java.util.LinkedHashMap<>();
        for (Issue issue : projectIssues) {
            String assignee = issue.getAssignee() == null ? "Unassigned" : issue.getAssignee().getName();
            workload.putIfAbsent(assignee, new AnalyticsDataDto.WorkloadBucket(assignee, 0, 0, 0, 0));
            AnalyticsDataDto.WorkloadBucket bucket = workload.get(assignee);
            if ("todo".equals(issue.getStatus())) bucket.setTodo(bucket.getTodo() + 1);
            else if ("in-progress".equals(issue.getStatus())) bucket.setInProgress(bucket.getInProgress() + 1);
            else if ("review".equals(issue.getStatus())) bucket.setReview(bucket.getReview() + 1);
            else bucket.setDone(bucket.getDone() + 1);
        }

        return new AnalyticsDataDto(
                statusCounts,
                new ArrayList<>(List.of(
                        new AnalyticsDataDto.CompletionBucket("Week 1", 3),
                        new AnalyticsDataDto.CompletionBucket("Week 2", 5),
                        new AnalyticsDataDto.CompletionBucket("Week 3", 4),
                        new AnalyticsDataDto.CompletionBucket("Week 4", 6))),
                new ArrayList<>(List.of(
                        new AnalyticsDataDto.VelocityBucket("Sprint 10", 8),
                        new AnalyticsDataDto.VelocityBucket("Sprint 11", 11),
                        new AnalyticsDataDto.VelocityBucket("Sprint 12", 5))),
                new ArrayList<>(workload.values()));
    }
}
