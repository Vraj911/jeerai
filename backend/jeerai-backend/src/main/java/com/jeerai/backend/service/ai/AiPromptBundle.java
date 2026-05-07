package com.jeerai.backend.service.ai;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.converter.BeanOutputConverter;
public record AiPromptBundle(Prompt prompt, BeanOutputConverter<?> converter) {
}
