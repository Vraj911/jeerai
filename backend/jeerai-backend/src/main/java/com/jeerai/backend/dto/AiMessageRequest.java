package com.jeerai.backend.dto;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
@Data
public class AiMessageRequest {
    @NotBlank(message = "message is required")
    private String message;
    @NotBlank(message = "mode is required")
    @Pattern(regexp = "generate|summary|priorities", message = "mode must be generate, summary, or priorities")
    private String mode;
    @NotBlank(message = "workspaceId is required")
    private String workspaceId;
    private String projectId;
    private List<AiChatMessage> history;
}
