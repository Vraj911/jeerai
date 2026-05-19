package com.jeerai.backend.service.ai.context;
import java.util.List;
public record GenerateContext(
        String projectName,
        String projectKey,
        String projectDescription,
        List<IssueSummary> existingIssues) {
}
