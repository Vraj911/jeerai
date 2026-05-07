package com.jeerai.backend.service.ai.context;

import java.util.List;

public record PriorityIssueSummary(
        String key,
        String title,
        String status,
        String priority,
        String assigneeName,
        List<String> labels,
        String updatedAt) {
}
