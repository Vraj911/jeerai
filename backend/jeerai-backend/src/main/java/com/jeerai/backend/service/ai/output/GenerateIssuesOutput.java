package com.jeerai.backend.service.ai.output;

import java.util.List;

public record GenerateIssuesOutput(
        String summary,
        List<IssueDraftOutput> issues) {
}
