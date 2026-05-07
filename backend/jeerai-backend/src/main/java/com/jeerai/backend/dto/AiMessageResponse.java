package com.jeerai.backend.dto;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiMessageResponse {
    private String reply;
    private String mode;
    private boolean requiresConfirmation;
    private List<AiSuggestion> suggestions;
    private String errorCode;
}
