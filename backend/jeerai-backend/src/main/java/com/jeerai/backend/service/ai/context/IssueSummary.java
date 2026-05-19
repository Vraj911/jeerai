package com.jeerai.backend.service.ai.context;
import java.util.List;
public record IssueSummary(
        String key,
        String title,
        String status,
        String priority,
        List<String> labels) {
}
