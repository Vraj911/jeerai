package com.jeerai.backend.controller;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.jeerai.backend.dto.AiMessageRequest;
import com.jeerai.backend.dto.AiMessageResponse;
import com.jeerai.backend.service.AiService;
@RestController
@RequestMapping(path = "/api/ai", produces = MediaType.APPLICATION_JSON_VALUE)
public class AiController {
    private final AiService aiService;
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }
    @PostMapping(path = "/message", consumes = MediaType.APPLICATION_JSON_VALUE)
    public AiMessageResponse sendMessage(@RequestBody AiMessageRequest request) {
        return new AiMessageResponse(aiService.sendMessage(request.getMessage()));
    }
}
