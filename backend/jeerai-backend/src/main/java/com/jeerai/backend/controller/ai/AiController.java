package com.jeerai.backend.controller.ai;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.jeerai.backend.dto.AiMessageRequest;
import com.jeerai.backend.dto.AiMessageResponse;
import com.jeerai.backend.service.ai.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(path = "/api/ai", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping(path = "/message", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AiMessageResponse> sendMessage(@Valid @RequestBody AiMessageRequest request) {
        return ResponseEntity.ok(aiService.processMessage(request));
    }
}
