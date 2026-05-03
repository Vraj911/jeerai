# AI Feature Implementation Plan
# Status: Full rewrite — complete OpenRouter LLM pipeline, every stage specified
# Intended for: Cursor AI — read every section before generating any code

---

## 0. Architectural decisions — lock these before touching any code

### Decision 1: LLM provider — OpenRouter calling OpenAI models

The app uses **OpenRouter** as the API gateway to reach OpenAI models.
OpenRouter exposes an OpenAI-compatible REST API.
Spring AI's OpenAI starter works with OpenRouter by overriding the base URL.

This means:
- Spring AI OpenAI starter is used — NOT a custom HTTP client
- Base URL is overridden to `https://openrouter.ai/api/v1`
- API key is the OpenRouter API key (not an OpenAI key)
- Model string is `openai/gpt-4o` (OpenRouter format)

The complete LLM call chain is:

```
AiService
  → AiContextService          (loads real project/issue data)
  → AiPromptBuilder           (builds Spring AI Prompt + BeanOutputConverter)
  → ChatClient.call(prompt)   (Spring AI — blocking)
  → OpenRouter API            (https://openrouter.ai/api/v1/chat/completions)
  → openai/gpt-4o model       (executes and returns JSON string)
  → BeanOutputConverter       (parses raw string into typed Java record)
  → AiResponseMapper          (maps record to AiMessageResponse DTO)
  → AiController              (returns ResponseEntity<AiMessageResponse>)
  → Frontend                  (renders suggestions in chat UI)
```

Every stage of this pipeline is specified in this document.
Cursor must implement ALL stages — not just the wrapper classes.

### Decision 2: Streaming vs blocking

- Phase 1 (now): **blocking**. `ChatClient` returns a full `String`. Endpoint returns `ResponseEntity<AiMessageResponse>`. Frontend simulated streaming stays as-is.
- Phase 2 (future): real streaming with `StreamingChatClient` + `Flux<String>` + `text/event-stream`.

Do NOT implement streaming in Phase 1.

### Decision 3: Structured output mechanism

Use **Spring AI `BeanOutputConverter<T>`** to parse model output into typed Java records.
Do NOT use regex, string matching, or manual JSON parsing.
If parsing fails: catch the exception, log raw output at WARN, return `errorCode = PARSE_FAILED`.

### Decision 4: Multi-turn history

`history` field is in the request DTO for forward compatibility.
It is a **no-op in Phase 1**. Do not wire it to anything.

---

## 1. Current scope

AI is one product feature: **AI Workspace**.

Three modes inside that feature:
1. `Generate Issues`
2. `Backlog Summary`
3. `Priority Suggestions`

---

## 2. What already exists in the frontend

Based on `frontend/src/pages/system/AIWorkspacePage.tsx`:

1. Route at `/app/ai`
2. Three section buttons: Generate Issues, Backlog Summary, Priority Suggestions
3. Chat-style interface with simulated streaming output — **keep this, do not remove**
4. Confirmation bar with Confirm and Cancel
5. Page reads real issue data using `useIssues()`
6. AI response currently from local mock `getAIResponse(...)` — **fully replaced in Phase 6**
7. `frontend/src/api/ai.api.ts` exists but contract is too simple
8. Backend `AiService` is currently a stub returning a hardcoded string

Conclusion: frontend design is complete. The real work is backend AI implementation and wiring.

---

## 3. What the AI feature should do

Planning assistance grounded on real project data. NOT a general chatbot.

1. Generate issue drafts from a description
2. Summarize project/backlog state
3. Suggest priorities for what to work on next

---

## 4. Product definition of each AI mode

### 4.1 Generate Issues

User gives a feature idea or problem statement. AI returns 3–6 structured issue drafts.
Each draft: title, description, suggested priority, optional labels, rationale.
**AI must NOT create issues.** Returns drafts for user approval only.

Example inputs:
- `Generate issues for user authentication`
- `Break down notifications feature`
- `Create backend and frontend tasks for file upload`

### 4.2 Backlog Summary

User asks for a quick understanding of project state. AI returns:
- Short overview
- Progress snapshot with concrete numbers
- Risk highlights
- Bottleneck highlights
- Concise — not a large report (150–250 words)

Example inputs:
- `Summarize current project status`
- `What is going on in this backlog?`

### 4.3 Priority Suggestions

User asks what to work on next. AI returns top 5 ranked existing issues with reasoning.
Must reason over real state — NOT just repeat existing priority field values.

Example inputs:
- `What should we do next?`
- `Suggest the top priorities`

---

## 5. Full LLM pipeline — every stage

This is the most important section. Every stage must be implemented.

```
STAGE 1 — HTTP request arrives at backend
  POST /api/ai/message
  Body: AiMessageRequest { message, mode, workspaceId, projectId, history }

STAGE 2 — AiController
  Validates request fields with @Valid
  Calls AiService.processMessage(request)
  Returns ResponseEntity<AiMessageResponse>

STAGE 3 — AiService: access check
  Calls WorkspaceAccessService.requireProjectReadAccess(projectId)
  If denied → return AiMessageResponse with errorCode = ACCESS_DENIED

STAGE 4 — AiService: config check
  Checks app.ai.enabled = true
  Checks spring.ai.openai.api-key is not blank or placeholder
  If either fails → return AiMessageResponse with errorCode = MISSING_CONFIG

STAGE 5 — AiContextService: load grounding data
  Based on mode, calls one of three methods:
    loadGenerateContext(projectId)  → GenerateContext record
    loadSummaryContext(projectId)   → SummaryContext record
    loadPriorityContext(projectId)  → PriorityContext record
  Each method applies context size caps (see Section 9)
  Returns a typed context record

STAGE 6 — AiPromptBuilder: build Prompt object
  Receives: mode + userMessage + context record
  Loads system prompt text from resources/prompts/ai-{mode}-system.txt
  Serializes context record to JSON string using ObjectMapper
  Creates BeanOutputConverter<T> for the correct output record type
  Calls converter.getFormat() to get JSON schema instructions
  Builds SystemMessage: system prompt text + serialized context JSON
  Builds UserMessage: user message + converter.getFormat() instructions
  Wraps in Spring AI Prompt object
  Returns AiPromptBundle(prompt, converter)

STAGE 7 — ChatClient: actual HTTP call to OpenRouter
  chatClient.call(prompt)
  Spring AI sends POST to https://openrouter.ai/api/v1/chat/completions
  Headers sent:
    Authorization: Bearer {OPENROUTER_API_KEY}
    HTTP-Referer: {app.ai.openrouter.referer}  ← REQUIRED by OpenRouter
    X-Title: JeerAI                             ← REQUIRED by OpenRouter
    Content-Type: application/json
  Body sent:
    model: openai/gpt-4o
    temperature: 0.3
    max_tokens: 2000
    messages: [
      { role: "system", content: "<system prompt + context JSON>" },
      { role: "user",   content: "<user message + format instructions>" }
    ]
  Returns: ChatResponse from Spring AI

STAGE 8 — Extract raw content string
  String rawContent = chatResponse.getResult().getOutput().getContent()
  This is the raw text string returned by gpt-4o

STAGE 9 — BeanOutputConverter: parse structured JSON
  converter.convert(rawContent)
  Returns typed Java record matching the output type for the mode:
    generate   → GenerateIssuesOutput
    summary    → BacklogSummaryOutput
    priorities → PriorityListOutput
  If this throws: catch, log rawContent at WARN, return errorCode = PARSE_FAILED

STAGE 10 — AiResponseMapper: map to response DTO
  Receives typed record + mode
  Maps to AiMessageResponse with:
    reply (human-readable text)
    mode
    requiresConfirmation (true only for generate mode)
    suggestions[] (typed list of AiSuggestion)

STAGE 11 — AiController returns to frontend
  ResponseEntity.ok(aiMessageResponse)
  Frontend receives JSON with reply + suggestions
```

---

## 6. OpenRouter + Spring AI setup

### 6.1 Why OpenRouter works with Spring AI OpenAI starter

OpenRouter's API is OpenAI-compatible. Spring AI lets you override the base URL.
No custom HTTP client needed — only config overrides and one header bean.

### 6.2 pom.xml — add this dependency

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
</dependency>
```

The Spring AI BOM already in pom.xml at version `1.1.2` manages the version.
Do NOT add a `<version>` tag.

### 6.3 application.properties — add these keys

```properties
# AI feature flag
app.ai.enabled=true

# Context size caps
app.ai.context.max-issues=50
app.ai.context.max-priority-issues=30

# OpenRouter referer header (required by OpenRouter)
app.ai.openrouter.referer=http://localhost:5173

# Spring AI — override base URL to OpenRouter
spring.ai.openai.base-url=https://openrouter.ai/api/v1
spring.ai.openai.chat.options.model=openai/gpt-4o
spring.ai.openai.chat.options.temperature=0.3
spring.ai.openai.chat.options.max-tokens=2000
```

### 6.4 .env.properties — add this key (never commit this file)

```properties
spring.ai.openai.api-key=sk-or-YOUR_OPENROUTER_KEY_HERE
```

### 6.5 AiClientConfig.java — required OpenRouter headers

OpenRouter requires `HTTP-Referer` and `X-Title` on every request.
Spring AI does not add these by default.
Wire them via a custom `OpenAiApi` bean.

Create `com.jeerai.backend.ai.AiClientConfig.java`:

```java
@Configuration
public class AiClientConfig {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.base-url}")
    private String baseUrl;

    @Value("${app.ai.openrouter.referer}")
    private String referer;

    @Bean
    @Primary
    public OpenAiApi openAiApi() {
        return new OpenAiApi(
            baseUrl,
            apiKey,
            RestClient.builder()
                .defaultHeader("HTTP-Referer", referer)
                .defaultHeader("X-Title", "JeerAI")
        );
    }
}
```

This bean is picked up by Spring AI auto-configuration to construct the `ChatClient`.
Without this, the `HTTP-Referer` and `X-Title` headers will be missing and OpenRouter will reject requests.

---

## 7. Backend service design

### 7.1 Service split — full list

| Class | Responsibility |
|---|---|
| `AiController` | HTTP only — receive request, return response |
| `AiService` | Orchestrator — runs all stages in order, handles all errors |
| `AiContextService` | Loads project/issue data for prompting — no Spring AI dependency |
| `AiPromptBuilder` | Builds Spring AI `Prompt` objects — no `ChatClient` dependency |
| `AiResponseMapper` | Maps typed output records to `AiMessageResponse` |
| `AiClientConfig` | Wires OpenRouter headers into Spring AI's HTTP client |
| `AiErrorCode` | Enum of all error codes |
| `AiPromptBundle` | Internal record carrying `Prompt` + `BeanOutputConverter` together |

Place all in package: `com.jeerai.backend.ai`

### 7.2 AiController

```java
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/message")
    public ResponseEntity<AiMessageResponse> sendMessage(
        @Valid @RequestBody AiMessageRequest request
    ) {
        return ResponseEntity.ok(aiService.processMessage(request));
    }
}
```

No logic here. Validation via `@Valid` only.

### 7.3 AiService.processMessage() — full implementation

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final ChatClient chatClient;
    private final AiContextService aiContextService;
    private final AiPromptBuilder aiPromptBuilder;
    private final AiResponseMapper aiResponseMapper;
    private final WorkspaceAccessService workspaceAccessService;

    @Value("${app.ai.enabled:false}")
    private boolean aiEnabled;

    @Value("${spring.ai.openai.api-key:}")
    private String apiKey;

    public AiMessageResponse processMessage(AiMessageRequest request) {

        // Stage 3: access check
        try {
            workspaceAccessService.requireProjectReadAccess(request.getProjectId());
        } catch (Exception e) {
            return errorResponse("You do not have access to this project.", AiErrorCode.ACCESS_DENIED, request.getMode());
        }

        // Stage 4: config check
        if (!aiEnabled || apiKey == null || apiKey.isBlank()) {
            return errorResponse("AI is not configured. Contact your admin.", AiErrorCode.MISSING_CONFIG, request.getMode());
        }

        // Stage 5: load context
        Object context;
        try {
            context = aiContextService.loadContext(request.getMode(), request.getProjectId());
        } catch (BadRequestException e) {
            return errorResponse("Invalid AI mode.", AiErrorCode.INVALID_MODE, request.getMode());
        }

        // Stage 6: build prompt
        AiPromptBundle bundle = aiPromptBuilder.build(request.getMode(), request.getMessage(), context);

        // Stages 7-8: call OpenRouter via Spring AI ChatClient
        String rawContent;
        try {
            ChatResponse chatResponse = chatClient.call(bundle.prompt());
            rawContent = chatResponse.getResult().getOutput().getContent();
        } catch (Exception e) {
            log.error("OpenRouter call failed for mode {}: {}", request.getMode(), e.getMessage(), e);
            return errorResponse("AI provider is unavailable. Please try again later.", AiErrorCode.PROVIDER_UNAVAILABLE, request.getMode());
        }

        // Stage 9-10: parse and map
        try {
            return aiResponseMapper.map(request.getMode(), rawContent, bundle.converter());
        } catch (Exception e) {
            log.warn("Failed to parse AI output for mode {}. Raw content: {}", request.getMode(), rawContent);
            return errorResponse("I had trouble structuring my response. Please try again.", AiErrorCode.PARSE_FAILED, request.getMode());
        }
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
```

### 7.4 AiPromptBundle

```java
public record AiPromptBundle(
    Prompt prompt,
    BeanOutputConverter<?> converter
) {}
```

---

## 8. AiPromptBuilder — full implementation

```java
@Component
@RequiredArgsConstructor
public class AiPromptBuilder {

    private final ObjectMapper objectMapper;

    public AiPromptBundle build(String mode, String userMessage, Object context) {

        // Step 1: load system prompt from classpath
        String systemPromptText = loadSystemPrompt(mode);

        // Step 2: serialize context to JSON for injection into the prompt
        String contextJson;
        try {
            contextJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(context);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize AI context", e);
        }

        // Step 3: create BeanOutputConverter for correct output type
        BeanOutputConverter<?> converter = switch (mode) {
            case "generate"    -> new BeanOutputConverter<>(GenerateIssuesOutput.class);
            case "summary"     -> new BeanOutputConverter<>(BacklogSummaryOutput.class);
            case "priorities"  -> new BeanOutputConverter<>(PriorityListOutput.class);
            default -> throw new IllegalArgumentException("Unknown AI mode: " + mode);
        };

        // Step 4: build system message = system prompt + project context data
        String fullSystemContent = systemPromptText
            + "\n\n--- PROJECT CONTEXT (use this data to ground your response) ---\n"
            + contextJson;

        // Step 5: build user message = user's actual message + JSON format instructions
        // converter.getFormat() returns the JSON schema the model must follow exactly
        String fullUserContent = userMessage
            + "\n\n--- REQUIRED OUTPUT FORMAT (respond ONLY in this JSON format, no extra text) ---\n"
            + converter.getFormat();

        // Step 6: construct Spring AI Prompt
        Prompt prompt = new Prompt(List.of(
            new SystemMessage(fullSystemContent),
            new UserMessage(fullUserContent)
        ));

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
```

The key line is `converter.getFormat()` — this is what Spring AI generates automatically from the Java record's field definitions. It tells gpt-4o exactly what JSON structure to return. Do NOT omit this.

---

## 9. AiContextService — exact fields per mode

No Spring AI dependency. Injects repositories only. Testable in isolation.

```java
@Service
@RequiredArgsConstructor
public class AiContextService {

    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;
    private final ActivityRepository activityRepository;

    @Value("${app.ai.context.max-issues:50}")
    private int maxIssues;

    @Value("${app.ai.context.max-priority-issues:30}")
    private int maxPriorityIssues;

    public Object loadContext(String mode, String projectId) {
        return switch (mode) {
            case "generate"    -> loadGenerateContext(projectId);
            case "summary"     -> loadSummaryContext(projectId);
            case "priorities"  -> loadPriorityContext(projectId);
            default -> throw new BadRequestException("Unknown AI mode: " + mode);
        };
    }
}
```

### GenerateContext

Load: project name, key, description.
Issues: filter to open statuses (todo, in-progress, review).
Sort: by priority descending (highest first), then updatedAt descending.
Cap: first `maxIssues` only.
Fields per issue: key, title, status, priority, labels. No description (too long).

```java
public record GenerateContext(
    String projectName,
    String projectKey,
    String projectDescription,
    List<IssueSummary> existingIssues
) {}

public record IssueSummary(
    String key,
    String title,
    String status,
    String priority,
    List<String> labels
) {}
```

### SummaryContext

Load: all issues for project.
Compute: countByStatus map, countByPriority map, unassignedOpenCount, recentActivityCount (last 7 days).
Open issues list: capped at `maxIssues`, sorted by priority desc.

```java
public record SummaryContext(
    String projectName,
    Map<String, Long> countByStatus,
    Map<String, Long> countByPriority,
    long unassignedOpenCount,
    long recentActivityCount,
    List<IssueSummary> openIssues
) {}
```

### PriorityContext

Load: open issues only (not done, not cancelled).
Sort: updatedAt descending (most recently touched first).
Cap: first `maxPriorityIssues`.
Fields per issue: key, title, status, priority, assigneeName (null if unassigned), labels, updatedAt.

```java
public record PriorityContext(
    String projectName,
    List<PriorityIssueSummary> openIssues
) {}

public record PriorityIssueSummary(
    String key,
    String title,
    String status,
    String priority,
    String assigneeName,
    List<String> labels,
    String updatedAt
) {}
```

Token budget rationale: 50 issues × ~150 tokens each = ~7,500 tokens. Safe for gpt-4o's 128k context window. Do not exceed the cap.

---

## 10. Structured output records

Place in `com.jeerai.backend.ai.output`.
These records are the targets for `BeanOutputConverter`. Fields must be simple types — no nested records with generics that Jackson cannot handle.

```java
// Generate mode output
public record IssueDraftOutput(
    String title,
    String description,
    String priority,        // low | medium | high | highest
    List<String> labels,
    String rationale
) {}

public record GenerateIssuesOutput(
    String summary,
    List<IssueDraftOutput> issues
) {}

// Summary mode output
public record BacklogSummaryOutput(
    String overview,
    String progressSnapshot,
    List<String> risks,
    List<String> bottlenecks
) {}

// Priorities mode output
public record PrioritySuggestionOutput(
    String issueKey,
    String issueTitle,
    int rank,
    String rationale
) {}

public record PriorityListOutput(
    String summary,
    List<PrioritySuggestionOutput> suggestions
) {}
```

Spring AI's `BeanOutputConverter` generates a JSON schema from these records and appends it to the prompt via `converter.getFormat()`. The model is instructed to return JSON matching exactly this schema.

---

## 11. AiResponseMapper — full implementation

```java
@Component
public class AiResponseMapper {

    @SuppressWarnings("unchecked")
    public AiMessageResponse map(String mode, String rawContent, BeanOutputConverter<?> converter) {
        AiMessageResponse response = new AiMessageResponse();
        response.setMode(mode);
        response.setErrorCode(null);

        switch (mode) {
            case "generate" -> {
                GenerateIssuesOutput output =
                    ((BeanOutputConverter<GenerateIssuesOutput>) converter).convert(rawContent);
                response.setReply(output.summary());
                response.setRequiresConfirmation(true);
                response.setSuggestions(
                    output.issues().stream().map(draft -> {
                        AiSuggestion s = new AiSuggestion();
                        s.setType("issue_draft");
                        s.setTitle(draft.title());
                        s.setDescription(draft.description());
                        s.setPriority(draft.priority());
                        s.setLabels(draft.labels());
                        s.setRationale(draft.rationale());
                        return s;
                    }).toList()
                );
            }
            case "summary" -> {
                BacklogSummaryOutput output =
                    ((BeanOutputConverter<BacklogSummaryOutput>) converter).convert(rawContent);
                response.setReply(output.overview() + "\n\n" + output.progressSnapshot());
                response.setRequiresConfirmation(false);
                List<AiSuggestion> items = new ArrayList<>();
                if (output.risks() != null) {
                    output.risks().forEach(risk -> {
                        AiSuggestion s = new AiSuggestion();
                        s.setType("summary");
                        s.setTitle("Risk");
                        s.setDescription(risk);
                        items.add(s);
                    });
                }
                if (output.bottlenecks() != null) {
                    output.bottlenecks().forEach(bn -> {
                        AiSuggestion s = new AiSuggestion();
                        s.setType("summary");
                        s.setTitle("Bottleneck");
                        s.setDescription(bn);
                        items.add(s);
                    });
                }
                response.setSuggestions(items);
            }
            case "priorities" -> {
                PriorityListOutput output =
                    ((BeanOutputConverter<PriorityListOutput>) converter).convert(rawContent);
                response.setReply(output.summary());
                response.setRequiresConfirmation(false);
                response.setSuggestions(
                    output.suggestions().stream().map(p -> {
                        AiSuggestion s = new AiSuggestion();
                        s.setType("priority_suggestion");
                        s.setTitle(p.issueKey() + ": " + p.issueTitle());
                        s.setRationale(p.rationale());
                        s.setRank(p.rank());
                        return s;
                    }).toList()
                );
            }
        }

        return response;
    }
}
```

---

## 12. DTO definitions

### AiMessageRequest.java

```java
@Data
public class AiMessageRequest {

    @NotBlank(message = "message is required")
    private String message;

    @NotBlank(message = "mode is required")
    @Pattern(regexp = "generate|summary|priorities", message = "mode must be generate, summary, or priorities")
    private String mode;

    @NotBlank(message = "workspaceId is required")
    private String workspaceId;

    private String projectId;                 // required in practice — validated in AiService

    private List<AiChatMessage> history;      // no-op in Phase 1, reserved for multi-turn
}
```

### AiChatMessage.java

```java
@Data
public class AiChatMessage {
    private String role;      // "user" | "assistant"
    private String content;
}
```

### AiMessageResponse.java

```java
@Data
public class AiMessageResponse {
    private String reply;
    private String mode;
    private boolean requiresConfirmation;
    private List<AiSuggestion> suggestions;
    private String errorCode;          // null on success, AiErrorCode.name() on failure
}
```

### AiSuggestion.java

```java
@Data
public class AiSuggestion {
    private String type;           // "issue_draft" | "summary" | "priority_suggestion"
    private String title;
    private String description;
    private String priority;       // for issue_draft
    private List<String> labels;   // for issue_draft
    private String rationale;      // for issue_draft and priority_suggestion
    private String issueId;        // optional — for priority_suggestion if referencing existing issue
    private Integer rank;          // for priority_suggestion
}
```

### AiErrorCode.java

```java
public enum AiErrorCode {
    PROVIDER_UNAVAILABLE,    // OpenRouter or model is down
    PARSE_FAILED,            // model returned unparseable output
    ACCESS_DENIED,           // user lacks project access
    INVALID_MODE,            // mode not recognized
    MISSING_CONFIG           // API key or feature flag missing
}
```

---

## 13. System prompt files — full content

### src/main/resources/prompts/ai-generate-system.txt

```
You are a project planning assistant inside JeerAI, a project management tool.
Your job is to break down a user feature request into concrete, implementable issue drafts.
You will be given the project name, description, and a list of existing issues.

Rules:
- Do not duplicate existing issues. Check the existing issues list before generating.
- Generate between 3 and 6 issue drafts only. Never more than 6.
- Each draft must have: title, description, priority (low/medium/high/highest), labels (array, can be empty), rationale.
- Keep titles concise and actionable. Start with a verb: Create, Implement, Add, Fix, Build, Write.
- Descriptions should be 1 to 3 sentences only.
- Do not invent facts not present in the project context.
- Respond ONLY in the JSON format described in the user message.
- No preamble. No explanation outside the JSON. Return only valid JSON.
```

### src/main/resources/prompts/ai-summary-system.txt

```
You are a project status analyst inside JeerAI, a project management tool.
Your job is to summarize the current state of a project backlog clearly and concisely.
You will be given issue counts by status and priority, and a list of open issues.

Rules:
- Keep overview and progressSnapshot concise — 150 to 250 words combined.
- Mention concrete numbers from the data provided.
- Identify risks: things that might go wrong or indicate problems.
- Identify bottlenecks: things that are slowing progress right now.
- Do not fabricate any metrics or numbers not in the provided data.
- Respond ONLY in the JSON format described in the user message.
- No preamble. No explanation outside the JSON. Return only valid JSON.
```

### src/main/resources/prompts/ai-priorities-system.txt

```
You are a project prioritization assistant inside JeerAI, a project management tool.
Your job is to recommend which open issues should be worked on next.
You will be given a list of open issues with their status, priority, assignee, and labels.

Rules:
- Select the top 5 issues maximum. Fewer is fine if only a few issues exist.
- Rank them 1 (most important) to 5 (least important).
- Justify each ranking. Consider: priority label, current status, recency of update, whether it is already in-progress, workload signals.
- Do not simply repeat the existing priority field value as the rationale. Reason about it.
- If an issue is in-progress, it may deserve top rank to avoid context switching.
- Respond ONLY in the JSON format described in the user message.
- No preamble. No explanation outside the JSON. Return only valid JSON.
```

---

## 14. Complete file list

### Backend — new files

```
src/main/java/com/jeerai/backend/ai/
    AiClientConfig.java
    AiPromptBundle.java
    AiContextService.java
    AiPromptBuilder.java
    AiResponseMapper.java
    AiErrorCode.java

    context/
        GenerateContext.java
        SummaryContext.java
        PriorityContext.java
        IssueSummary.java
        PriorityIssueSummary.java

    output/
        IssueDraftOutput.java
        GenerateIssuesOutput.java
        BacklogSummaryOutput.java
        PrioritySuggestionOutput.java
        PriorityListOutput.java

src/main/resources/prompts/
    ai-generate-system.txt
    ai-summary-system.txt
    ai-priorities-system.txt
```

### Backend — modified files

```
pom.xml
    — add spring-ai-openai-spring-boot-starter

src/main/resources/application.properties
    — add app.ai.enabled=true
    — add app.ai.context.max-issues=50
    — add app.ai.context.max-priority-issues=30
    — add app.ai.openrouter.referer=http://localhost:5173
    — add spring.ai.openai.base-url=https://openrouter.ai/api/v1
    — add spring.ai.openai.chat.options.model=openai/gpt-4o
    — add spring.ai.openai.chat.options.temperature=0.3
    — add spring.ai.openai.chat.options.max-tokens=2000

.env.properties (never commit)
    — add spring.ai.openai.api-key=sk-or-YOUR_OPENROUTER_KEY

dto/AiMessageRequest.java        — full replacement
dto/AiMessageResponse.java       — full replacement
dto/AiChatMessage.java           — new
dto/AiSuggestion.java            — new
service/AiService.java           — full rewrite
controller/AiController.java     — minor update (already thin)
controller/GlobalExceptionHandler.java — no changes needed (AiService returns clean responses)
```

### Frontend — modified files

```
frontend/src/types/ai.ts
    — add AiMessageRequest, AiMessageResponse, AiSuggestion, AiChatMessage types

frontend/src/api/ai.api.ts
    — rewrite to POST /api/ai/message with full new request shape
    — typed return: Promise<AiMessageResponse>

frontend/src/pages/system/AIWorkspacePage.tsx
    — replace getAIResponse(...) entirely in one commit
    — call ai.api.ts instead
    — render suggestions[] from response
    — show confirm bar only when requiresConfirmation === true
    — handle each errorCode state per Section 15
```

---

## 15. Frontend error state handling

| errorCode | UI behavior |
|---|---|
| `PROVIDER_UNAVAILABLE` | Show reply in chat + toast: "AI provider unavailable, try again later" |
| `PARSE_FAILED` | Show reply in chat, no confirm bar shown |
| `ACCESS_DENIED` | Show reply in chat |
| `MISSING_CONFIG` | Show reply in chat + note: "AI is not configured — contact admin" |
| `INVALID_MODE` | Should never reach user — show generic error toast |
| `null` (success) | Render suggestions[], show confirm bar if requiresConfirmation is true |
| fetch throws (network error) | Show toast: "Could not reach server" |

---

## 16. Confirm-to-create issue flow

For generate mode only:

1. Backend returns `suggestions[]` of type `issue_draft`
2. Frontend renders each draft in the chat
3. User clicks Confirm
4. Frontend calls `POST /api/issues` for each confirmed draft — one call per draft
5. Normal `IssueService` handles creation

This preserves: permission checks (`CREATE_ISSUES`), activity logs, notifications, issue key generation.

Do NOT create a bulk issue endpoint. One `POST /api/issues` call per draft.
Do NOT bypass `IssueService`.

---

## 17. Implementation build order — follow exactly

### Phase 1: pom.xml + config only

Done when:
1. `spring-ai-openai-spring-boot-starter` added
2. All config keys in `application.properties`
3. OpenRouter API key in `.env.properties`
4. `AiClientConfig.java` created — custom `OpenAiApi` bean with OpenRouter headers
5. App starts cleanly — no errors

### Phase 2: DTOs and output records

Done when:
1. `AiMessageRequest`, `AiMessageResponse`, `AiSuggestion`, `AiChatMessage` created/replaced
2. `AiErrorCode` enum created
3. All output records created in `ai.output`
4. All context records created in `ai.context`
5. No LLM calls yet

### Phase 3: AiContextService — build and test in isolation

Done when:
1. All three load methods implemented with caps
2. Unit tests pass with mocked repositories
3. Zero Spring AI imports in this class

### Phase 4: AiPromptBuilder — build and test in isolation

Done when:
1. Prompt files created in `resources/prompts/`
2. `AiPromptBuilder.build()` implemented exactly as Section 8
3. `AiPromptBundle` record created
4. Unit test: call `build()` for each mode, assert prompt contains context JSON and converter format instructions
5. Zero `ChatClient` imports in this class

### Phase 5: AiService wiring — first real LLM call

Done when:
1. `AiService.processMessage()` implemented as Section 7.3
2. `ChatClient` injected and called
3. `AiResponseMapper` implemented as Section 11
4. All error paths return correct `errorCode`
5. Manual test: POST to `/api/ai/message` with mode=summary — OpenRouter responds — response is structured

### Phase 6: Frontend connection

Done when:
1. `ai.api.ts` calls backend with new DTO shape
2. Types in `ai.ts` match backend
3. `AIWorkspacePage.tsx` replaces `getAIResponse(...)` entirely in one commit
4. Each errorCode state handled per Section 15
5. Confirm bar shows only when `requiresConfirmation === true`

### Phase 7: Confirm-to-create flow

Done when:
1. Confirm button calls `POST /api/issues` per draft
2. Issues appear in project list
3. No bypass of `IssueService`

---

## 18. Testing plan

### Backend unit tests

1. `AiContextServiceTest`
   - verify correct fields loaded per mode with mocked repos
   - verify cap applied: >50 issues → only 50 returned
   - verify open-only filter in priority context

2. `AiPromptBuilderTest`
   - verify system prompt loaded from classpath per mode
   - verify context JSON present in system message content
   - verify `converter.getFormat()` string present in user message content
   - verify correct converter type returned per mode

3. `AiResponseMapperTest`
   - generate mode: `requiresConfirmation = true`, suggestions mapped correctly
   - summary mode: risks and bottlenecks mapped as summary-type suggestions
   - priorities mode: rank and rationale mapped correctly

4. `AiServiceTest` (mock ChatClient)
   - mock returns valid JSON → full `AiMessageResponse` returned
   - ChatClient throws → `PROVIDER_UNAVAILABLE`
   - converter throws on bad JSON → `PARSE_FAILED`
   - access check throws → `ACCESS_DENIED`
   - apiKey blank → `MISSING_CONFIG`

### Backend integration test

`AiControllerIntegrationTest` (mock `ChatClient` bean):
- valid generate request → 200 with suggestions
- blank mode → 400
- invalid mode string → 400
- no auth token → 401

### Frontend verification

1. Each section button sends correct `mode`
2. Suggestions render in chat from backend response
3. Confirm bar visible for generate mode, hidden for summary/priorities
4. Each errorCode shows correct UI state
5. Confirm button triggers `POST /api/issues` per draft

---

## 19. Current limitations

- Multi-turn history deferred — `history` in DTO is unused
- Streaming deferred — frontend simulates it
- No retry on provider failure in Phase 1
- Token counting is approximate (issue count cap, not tokenizer)
- `AiService` is a stub through Phase 4 — intentional and temporary
- Automation rules are out of scope for this plan

---

## 20. 60-second summary

JeerAI AI Workspace has three modes: Generate Issues, Backlog Summary, Priority Suggestions. When the frontend sends `POST /api/ai/message`, the backend validates access, loads real project/issue data via `AiContextService` (capped to avoid token overflow), builds a controlled Spring AI `Prompt` via `AiPromptBuilder` using mode-specific system prompt files and `BeanOutputConverter` format instructions, then calls OpenRouter's OpenAI-compatible API via Spring AI's `ChatClient` with the base URL overridden to `https://openrouter.ai/api/v1` and required headers (`HTTP-Referer`, `X-Title`) injected via a custom `OpenAiApi` bean. The model is `openai/gpt-4o` at temperature 0.3. The raw string response is parsed by `BeanOutputConverter` into typed Java records, then mapped by `AiResponseMapper` into a structured `AiMessageResponse` with typed `suggestions[]`. The frontend renders suggestions in the chat. For generate mode, the user must confirm before any issue is created — confirmed drafts go through the normal `POST /api/issues` endpoint, preserving all permission checks and activity logging.