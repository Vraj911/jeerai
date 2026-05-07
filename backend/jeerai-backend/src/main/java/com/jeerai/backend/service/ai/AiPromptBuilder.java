package com.jeerai.backend.service.ai;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeerai.backend.service.ai.output.BacklogSummaryOutput;
import com.jeerai.backend.service.ai.output.GenerateIssuesOutput;
import com.jeerai.backend.service.ai.output.PriorityListOutput;
import lombok.RequiredArgsConstructor;
@Component
@RequiredArgsConstructor
public class AiPromptBuilder {
    private final ObjectMapper objectMapper;
    public AiPromptBundle build(String mode, String userMessage, Object context) {
        String systemPromptText = loadSystemPrompt(mode);
        String contextJson;
        try {
            contextJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(context);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize AI context", e);
        }
        BeanOutputConverter<?> converter = switch (mode) {
            case "generate" -> new BeanOutputConverter<>(GenerateIssuesOutput.class);
            case "summary" -> new BeanOutputConverter<>(BacklogSummaryOutput.class);
            case "priorities" -> new BeanOutputConverter<>(PriorityListOutput.class);
            default -> throw new IllegalArgumentException("Unknown AI mode: " + mode);
        };
        String fullSystemContent = systemPromptText
                + "\n\n--- PROJECT CONTEXT (use this data to ground your response) ---\n"
                + contextJson;
        String fullUserContent = userMessage
                + "\n\n--- REQUIRED OUTPUT FORMAT (respond ONLY in this JSON format, no extra text) ---\n"
                + converter.getFormat();
        Prompt prompt = new Prompt(List.of(
                new SystemMessage(fullSystemContent),
                new UserMessage(fullUserContent)));
        return new AiPromptBundle(prompt, converter);
    }
    private String loadSystemPrompt(String mode) {
        String filename = "prompts/ai-" + mode + "-system.txt";
        try {
            ClassPathResource resource = new ClassPathResource(filename);
            return resource.getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Could not load system prompt file: " + filename, e);
        }
    }
}
