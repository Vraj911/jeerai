package com.jeerai.backend.service.ai.output;

import java.util.List;

public record BacklogSummaryOutput(
        String overview,
        String progressSnapshot,
        List<String> risks,
        List<String> bottlenecks) {
}
