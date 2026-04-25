package com.jeerai.backend.service;
import org.springframework.stereotype.Service;
@Service
public class AiService {
    public String sendMessage(String message) {
        String safeMessage = message == null ? "" : message;
        return "AI response to: " + safeMessage;
    }
}
