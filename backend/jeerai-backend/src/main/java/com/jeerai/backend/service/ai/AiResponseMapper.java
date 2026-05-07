package com.jeerai.backend.service.ai;
import java.util.ArrayList;
import java.util.List;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Component;
import com.jeerai.backend.service.ai.output.BacklogSummaryOutput;
import com.jeerai.backend.service.ai.output.GenerateIssuesOutput;
import com.jeerai.backend.service.ai.output.PriorityListOutput;
import com.jeerai.backend.dto.AiMessageResponse;
import com.jeerai.backend.dto.AiSuggestion;
@Component
public class AiResponseMapper {
    @SuppressWarnings("unchecked")
    public AiMessageResponse map(String mode, String rawContent, BeanOutputConverter<?> converter) {
        AiMessageResponse response = new AiMessageResponse();
        response.setMode(mode);
        response.setErrorCode(null);
        switch (mode) {
            case "generate" -> {
                GenerateIssuesOutput output =
                        ((BeanOutputConverter<GenerateIssuesOutput>) converter).convert(rawContent);
                response.setReply(output.summary());
                response.setRequiresConfirmation(true);
                response.setSuggestions(
                        output.issues().stream().map(draft -> {
                            AiSuggestion s = new AiSuggestion();
                            s.setType("issue_draft");
                            s.setTitle(draft.title());
                            s.setDescription(draft.description());
                            s.setPriority(draft.priority());
                            s.setLabels(draft.labels());
                            s.setRationale(draft.rationale());
                            return s;
                        }).toList());
            }
            case "summary" -> {
                BacklogSummaryOutput output =
                        ((BeanOutputConverter<BacklogSummaryOutput>) converter).convert(rawContent);
                response.setReply(output.overview() + "\n\n" + output.progressSnapshot());
                response.setRequiresConfirmation(false);
                List<AiSuggestion> items = new ArrayList<>();
                if (output.risks() != null) {
                    output.risks().forEach(risk -> {
                        AiSuggestion s = new AiSuggestion();
                        s.setType("summary");
                        s.setTitle("Risk");
                        s.setDescription(risk);
                        items.add(s);
                    });
                }
                if (output.bottlenecks() != null) {
                    output.bottlenecks().forEach(bn -> {
                        AiSuggestion s = new AiSuggestion();
                        s.setType("summary");
                        s.setTitle("Bottleneck");
                        s.setDescription(bn);
                        items.add(s);
                    });
                }
                response.setSuggestions(items);
            }
            case "priorities" -> {
                PriorityListOutput output =
                        ((BeanOutputConverter<PriorityListOutput>) converter).convert(rawContent);
                response.setReply(output.summary());
                response.setRequiresConfirmation(false);
                response.setSuggestions(
                        output.suggestions().stream().map(p -> {
                            AiSuggestion s = new AiSuggestion();
                            s.setType("priority_suggestion");
                            s.setTitle(p.issueKey() + ": " + p.issueTitle());
                            s.setRationale(p.rationale());
                            s.setRank(p.rank());
                            return s;
                        }).toList());
            }
            default -> throw new IllegalStateException("Unexpected mode: " + mode);
        }
        return response;
    }
}
