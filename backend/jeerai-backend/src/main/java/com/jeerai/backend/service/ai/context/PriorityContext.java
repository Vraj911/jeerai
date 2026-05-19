package com.jeerai.backend.service.ai.context;
import java.util.List;
public record PriorityContext(
        String projectName,
        List<PriorityIssueSummary> openIssues) {
}
