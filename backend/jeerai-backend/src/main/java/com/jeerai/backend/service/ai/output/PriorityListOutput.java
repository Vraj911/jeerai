package com.jeerai.backend.service.ai.output;
import java.util.List;
public record PriorityListOutput(
        String summary,
        List<PrioritySuggestionOutput> suggestions) {
}
