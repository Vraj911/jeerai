package com.jeerai.backend.service.ai;
import java.util.List;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.UnknownContentTypeException;
import com.jeerai.backend.dto.AiMessageRequest;
import com.jeerai.backend.dto.AiMessageResponse;
import com.jeerai.backend.service.exception.BadRequestException;
import com.jeerai.backend.service.workspace.WorkspaceAccessService;
import lombok.extern.slf4j.Slf4j;
@Service
@Slf4j
public class AiService {
    private final ChatClient chatClient;
    private final AiContextService aiContextService;
    private final AiPromptBuilder aiPromptBuilder;
    private final AiResponseMapper aiResponseMapper;
    private final WorkspaceAccessService workspaceAccessService;
    @Value("${app.ai.enabled:true}")
    private boolean aiEnabled;
    @Value("${spring.ai.openai.api-key:}")
    private String apiKey;
    public AiService(
            ChatClient.Builder chatClientBuilder,
            AiContextService aiContextService,
            AiPromptBuilder aiPromptBuilder,
            AiResponseMapper aiResponseMapper,
            WorkspaceAccessService workspaceAccessService) {
        this.chatClient = chatClientBuilder.build();
        this.aiContextService = aiContextService;
        this.aiPromptBuilder = aiPromptBuilder;
        this.aiResponseMapper = aiResponseMapper;
        this.workspaceAccessService = workspaceAccessService;
    }
    public AiMessageResponse processMessage(AiMessageRequest request) {
        if (request.getProjectId() == null || request.getProjectId().isBlank()) {
            return errorResponse("projectId is required.", AiErrorCode.INVALID_MODE, request.getMode());
        }
        try {
            workspaceAccessService.requireProjectReadAccess(request.getProjectId());
        } catch (Exception e) {
            return errorResponse("You do not have access to this project.",
                    AiErrorCode.ACCESS_DENIED, request.getMode());
        }
        if (!aiEnabled || apiKey == null || apiKey.isBlank() || isPlaceholderApiKey(apiKey)) {
            return errorResponse("AI is not configured. Contact your admin.",
                    AiErrorCode.MISSING_CONFIG, request.getMode());
        }
        Object context;
        try {
            context = aiContextService.loadContext(request.getMode(), request.getProjectId());
        } catch (BadRequestException e) {
            return errorResponse("Invalid AI mode.", AiErrorCode.INVALID_MODE, request.getMode());
        }
        AiPromptBundle bundle = aiPromptBuilder.build(
                request.getMode(),
                request.getMessage(),
                context,
                request.getHistory()  
        );
        String rawContent;
        try {
            rawContent = chatClient.prompt(bundle.prompt()).call().content();
        } catch (Exception e) {
            log.error("OpenRouter call failed for mode {}: {}", request.getMode(), e.getMessage(), e);
            AiErrorCode code = AiErrorCode.PROVIDER_UNAVAILABLE;
            String reply = "AI provider is unavailable. Please try again later.";
            if (e instanceof RestClientResponseException rre) {
                int status = rre.getRawStatusCode();
                if (status == 401 || status == 403) {
                    code = AiErrorCode.MISSING_CONFIG;
                    reply = "AI is not configured or the API key is invalid.";
                } else if (status == 429) {
                    reply = "AI provider rate-limited the request. Please try again later.";
                }
            } else if (e instanceof UnknownContentTypeException ucte) {
                String bodyPreview;
                try {
                    String body = ucte.getResponseBodyAsString();
                    bodyPreview = body == null ? "<empty>"
                            : body.substring(0, Math.min(300, body.length()));
                } catch (Exception ignored) {
                    bodyPreview = "<unavailable>";
                }
                log.warn("OpenRouter returned unexpected content-type {}. Body preview: {}",
                        ucte.getContentType(), bodyPreview);
            }
            return errorResponse(reply, code, request.getMode());
        }
        try {
            return aiResponseMapper.map(request.getMode(), rawContent, bundle.converter());
        } catch (Exception e) {
            log.warn("Failed to parse AI output for mode {}. Raw content: {}",
                    request.getMode(), rawContent);
            return errorResponse(
                    "I had trouble structuring my response. Please try again.",
                    AiErrorCode.PARSE_FAILED, request.getMode());
        }
    }
    private boolean isPlaceholderApiKey(String key) {
        String k = key.trim();
        return k.equals("dummy-for-startup")
                || k.contains("YOUR_OPENROUTER")
                || k.contains("sk-or-YOUR");
    }
    private AiMessageResponse errorResponse(String reply, AiErrorCode code, String mode) {
        AiMessageResponse r = new AiMessageResponse();
        r.setReply(reply);
        r.setMode(mode);
        r.setErrorCode(code.name());
        r.setRequiresConfirmation(false);
        r.setSuggestions(List.of());
        return r;
    }
}