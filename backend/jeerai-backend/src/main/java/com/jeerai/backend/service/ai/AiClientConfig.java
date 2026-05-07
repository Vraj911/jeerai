package com.jeerai.backend.service.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.ai.openai.api.OpenAiApi;
@Configuration
public class AiClientConfig {
    @Bean
    @Primary
    public OpenAiApi openAiApi(
            @Value("${spring.ai.openai.base-url:https://openrouter.ai/api}") String baseUrl,
            @Value("${spring.ai.openai.api-key:}") String apiKey,
            @Value("${app.ai.openrouter.referer:http://localhost:5173}") String referer) {
        MultiValueMap<String, String> headers = new LinkedMultiValueMap<>();
        headers.add("HTTP-Referer", referer);
        headers.add("X-Title", "JeerAI");
        return OpenAiApi.builder()
                .baseUrl(baseUrl)
                .apiKey(apiKey)
                .headers(headers)
                .build();
    }
}
