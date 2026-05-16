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
    @Pattern(
        regexp = "generate|summary|priorities",
        message = "mode must be generate, summary, or priorities"
    )
    private String mode;

    /**
     * FIX: Removed @NotBlank from workspaceId.
     *
     * workspaceId was @NotBlank — meaning if frontend didn't send it,
     * the request failed with 400. But AiService never used workspaceId
     * for anything. Access control goes through projectId → workspace chain
     * via WorkspaceAccessService.requireProjectReadAccess(projectId).
     *
     * Making it optional prevents unnecessary 400 errors if a frontend
     * version forgets to include it, while keeping it available if needed
     * for future workspace-level validation.
     */
    private String workspaceId;

    @NotBlank(message = "projectId is required")
    private String projectId;

    /**
     * Optional conversation history for multi-turn AI sessions.
     * Passed to AiPromptBuilder to give the LLM memory of previous messages.
     * Each entry has role ("user" or "assistant") and content.
     */
    private List<AiChatMessage> history;
}