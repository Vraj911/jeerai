package com.jeerai.backend.service.ai.context;
import java.util.List;
import java.util.Map;
public record SummaryContext(
        String projectName,
        Map<String, Long> countByStatus,
        Map<String, Long> countByPriority,
        long unassignedOpenCount,
        long recentActivityCount,
        List<IssueSummary> openIssues) {
}
