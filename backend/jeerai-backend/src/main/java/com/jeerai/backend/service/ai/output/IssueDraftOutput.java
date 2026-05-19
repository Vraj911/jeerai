package com.jeerai.backend.service.ai.output;
import java.util.List;
public record IssueDraftOutput(
        String title,
        String description,
        String priority,
        List<String> labels,
        String rationale) {
}
