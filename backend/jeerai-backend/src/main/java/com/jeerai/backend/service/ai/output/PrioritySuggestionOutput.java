package com.jeerai.backend.service.ai.output;
public record PrioritySuggestionOutput(
        String issueKey,
        String issueTitle,
        int rank,
        String rationale) {
}
