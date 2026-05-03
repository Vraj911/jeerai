# Automation Feature Implementation Plan
# Status: Updated with event model, transaction boundaries, loop protection design, action execution safety, and sequencing guide
# Intended for: Cursor AI — read this fully before generating any code

---

## 0. Architectural decisions — lock these before touching code

### Decision 1: Event delivery mechanism

Use **Spring `ApplicationEventPublisher`** for automation event delivery.

- `IssueService` calls `applicationEventPublisher.publishEvent(automationEvent)`
- `AutomationExecutionService` listens with `@TransactionalEventListener`
- This decouples `IssueService` from automation entirely

Do NOT use direct method calls like `automationExecutionService.handle(event)` inside `IssueService`.
That creates tight coupling and makes testing harder.

### Decision 2: Transaction boundary — critical

Automation must run **after the original issue transaction commits**.

Use:
```java
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void onAutomationEvent(AutomationEvent event) { ... }
```

Why this matters:
- if automation runs inside the same transaction and throws, it rolls back the user's original issue update
- the user's action must always persist successfully regardless of automation outcome
- `AFTER_COMMIT` guarantees the issue is saved before automation touches anything

### Decision 3: How automation actions mutate issues

`AutomationActionExecutor` must call **repositories directly** for issue mutations.
It must NOT call `IssueService.update()` or `IssueService.updateStatus()`.

Why: calling `IssueService` from inside automation would re-publish a new `AutomationEvent`,
creating a recursive loop that loop protection alone cannot reliably stop.

The safe pattern:
- `AutomationActionExecutor` → `IssueRepository.save(issue)` directly
- After saving, `AutomationActionExecutor` calls `ActivityRepository.save(activity)` for the audit trail
- Notifications are created via `NotificationRepository.save(notification)` directly

### Decision 4: Loop protection mechanism

Use a **`ThreadLocal<AutomationExecutionContext>`** to carry execution state through the chain.

`AutomationExecutionContext` holds:
- `Set<String> executedRuleIds` — rules already run in this chain
- `int depth` — current recursion depth
- `String originIssueId` — issue that started the chain

Rules:
- max depth = 3 (configurable via `app.automation.max-depth` in `application.properties`)
- if `depth >= maxDepth`, stop execution and log a warning
- if `ruleId` is already in `executedRuleIds`, skip it (prevents same rule re-running)
- always clear the `ThreadLocal` in a `finally` block after execution completes

### Decision 5: Automation action origin tracking

`AutomationEvent` carries an `origin` field:
- `USER` — event came from a real user action
- `AUTOMATION` — event came from an automation action

When `AutomationActionExecutor` saves an issue mutation, it must NOT re-publish a new `AutomationEvent`.
That is the whole point of Decision 3 above — repository-direct writes don't trigger the listener.

---

## 1. Current scope

Automation is one feature: **Project Automation**.

This is internal backend workflow logic inside JeerAI.
It is NOT external workflow automation like n8n — that is a future concern.

Correct framing:
- one feature = `Automation`
- rule-based, deterministic, issue-driven workflow engine
- all execution happens server-side in Spring

---

## 2. What already exists in the frontend

Based on `frontend/src/pages/project/AutomationPage.tsx`:

### Existing UI behavior

1. Dedicated Automation page per project
2. Users can list, create, edit, delete rules
3. Users can enable or disable a rule
4. Rule builder uses a `WHEN / IF / THEN` model

### Existing rule types in frontend

Trigger types:
1. `issue_created`
2. `status_change`
3. `assignee_change`
4. `priority_change`

Condition types:
1. `status_is`
2. `priority_is`
3. `assignee_is`
4. `label_contains`

Action types:
1. `change_status`
2. `assign_user`
3. `add_label`
4. `send_notification`

### Existing technical state

1. `frontend/src/api/automation.api.ts` — API layer exists
2. `frontend/src/queries/automation.queries.ts` — query hooks exist
3. `frontend/src/types/automation.ts` — type contracts exist
4. Frontend already sends real rule payloads to backend

Conclusion: frontend product shape is complete. The missing work is **backend execution only**.

---

## 3. What the automation feature should do

Automatically react to issue changes inside a project:

1. An issue event happens (user action)
2. JeerAI checks all enabled rules for that project
3. Matching rules run in order
4. Deterministic actions happen
5. Activity/audit trail is recorded for every automation action

Similar to a simplified Jira automation model.

---

## 4. Product definition

Each rule has:

1. `WHEN` — the trigger event
2. `IF` — optional conditions (all must pass)
3. `THEN` — one action to perform

Example:

```
WHEN status_change -> review
IF   priority_is  -> high
THEN assign_user  -> qa-user-id
```

Meaning: when an issue moves to review AND it is high priority, assign it to QA automatically.

---

## 5. Example rules

### Auto-assign QA on review
```
WHEN status_change -> review
IF   priority_is  -> high
THEN assign_user  -> user-qa
```

### Auto-label highest priority issues
```
WHEN priority_change -> highest
THEN add_label       -> critical
```

### Notify on critical issue creation
```
WHEN issue_created
IF   label_contains -> critical
THEN send_notification
```

### Move assigned work to in-progress
```
WHEN assignee_change -> user-123
IF   status_is       -> todo
THEN change_status   -> in-progress
```

---

## 6. Current backend state

Existing backend files:
- `controller/AutomationRuleController.java` — CRUD endpoints exist
- `service/AutomationRuleService.java` — CRUD and toggle exist
- `model/AutomationRule.java` — domain model exists
- `dto/AutomationRuleCreateRequest.java` — exists
- `dto/AutomationRuleUpdateRequest.java` — exists

What exists:
1. Rule CRUD
2. Rule persistence
3. Project access checks
4. Toggle enable/disable

What does NOT exist yet:
1. Execution engine
2. Event publishing from `IssueService`
3. Condition evaluation
4. Action execution
5. Loop protection
6. Audit trail from automation actions

---

## 7. Why internal Spring implementation (not n8n)

1. Rules are tightly coupled to the issue lifecycle already in `IssueService`
2. Permissions already live in the backend
3. Notifications and activities already live in the backend
4. Deterministic workflow logic belongs in app code
5. No extra infrastructure or synchronization problems

Use n8n later only for external integrations (webhooks, Slack, email via third party).
Not for this first internal automation engine.

---

## 8. Backend service split

Do NOT overload `AutomationRuleService`.

### `AutomationRuleService` (already exists)
- CRUD and persistence only
- Add one new method: `findEnabledRulesByProjectId(String projectId)`
- This filters `enabled = true` — rules that are disabled must never execute

### `AutomationEvent` (new — internal event model)
- Published by `IssueService`
- Consumed by `AutomationExecutionService`
- See Section 9 for full field spec

### `AutomationExecutionService` (new)
- Annotated with `@TransactionalEventListener(phase = AFTER_COMMIT)`
- Receives `AutomationEvent`
- Loads enabled rules for the project
- For each rule: checks trigger match, evaluates conditions, executes action
- Manages `AutomationExecutionContext` via `ThreadLocal`
- Catches all exceptions per rule — one failing rule must not stop others

### `AutomationConditionEvaluator` (new)
- Stateless `@Component`
- Single method: `boolean evaluate(List<RuleCondition> conditions, Issue issue)`
- All conditions must pass (AND logic)
- See Section 12 for condition semantics

### `AutomationActionExecutor` (new)
- Stateless `@Component`
- Injects: `IssueRepository`, `NotificationRepository`, `ActivityRepository`, `UserRepository`
- Does NOT inject `IssueService` — direct repository access only (see Decision 3)
- Single method: `void execute(AutomationRule rule, Issue issue, String actorContext)`
- See Section 13 for action semantics

### `AutomationExecutionContext` (new — simple POJO)
- Holds execution state for loop protection
- Carried in a `ThreadLocal` managed by `AutomationExecutionService`
- Fields: `Set<String> executedRuleIds`, `int depth`, `String originIssueId`

Place all new automation classes in subpackage: `com.jeerai.backend.automation`

---

## 9. `AutomationEvent` — full specification

```java
public class AutomationEvent extends ApplicationEvent {

    private final String eventType;      // issue_created | status_change | assignee_change | priority_change
    private final String projectId;
    private final String issueId;
    private final String actorUserId;
    private final IssueSnapshot before;  // issue state before change (null for issue_created)
    private final IssueSnapshot after;   // issue state after change
    private final Instant occurredAt;
    private final EventOrigin origin;    // USER | AUTOMATION

    // inner record
    public record IssueSnapshot(
        String status,
        String priority,
        String assigneeId,
        List<String> labels
    ) {}

    public enum EventOrigin {
        USER, AUTOMATION
    }
}
```

Why `before` and `after` snapshots:
- trigger matching needs to know what value changed TO
- loop protection needs to detect automation-originated events
- `before` is null for `issue_created` events

`IssueSnapshot` should be built immediately before and after the issue is saved in `IssueService`.

---

## 10. Where to publish events in `IssueService`

Use `applicationEventPublisher.publishEvent(event)` at these points.
Always publish **after** `issueRepository.save(issue)` succeeds.
Always set `origin = EventOrigin.USER`.

### 10.1 After issue creation — in `IssueService.create(...)`

```java
// after issueRepository.save(issue)
applicationEventPublisher.publishEvent(
    new AutomationEvent(this, "issue_created", projectId, issueId, actorUserId, null, afterSnapshot, Instant.now(), EventOrigin.USER)
);
```

### 10.2 After generic issue update — in `IssueService.update(...)`

Capture `before` snapshot before the update. After saving:
- if `before.status != after.status` → publish `status_change`
- if `before.priority != after.priority` → publish `priority_change`
- if `before.assigneeId != after.assigneeId` → publish `assignee_change`

Each changed field publishes its own event. Multiple events can be published from one user update.

### 10.3 After status update — in `IssueService.updateStatus(...)`

```java
// after issueRepository.save(issue)
applicationEventPublisher.publishEvent(
    new AutomationEvent(this, "status_change", projectId, issueId, actorUserId, beforeSnapshot, afterSnapshot, Instant.now(), EventOrigin.USER)
);
```

**Important**: Only publish if the status actually changed. Compare before and after — do not publish if the value is the same.

---

## 11. Trigger matching rules

Load only `enabled = true` rules for the project before matching.

### 11.1 `issue_created`
- Match when `event.eventType == "issue_created"`
- Trigger value is ignored (blank or null is fine)

### 11.2 `status_change`
- Match when `event.eventType == "status_change"`
- If trigger value is non-blank: match only if `event.after.status == rule.trigger.value`
- If trigger value is blank: match any status change

### 11.3 `priority_change`
- Match when `event.eventType == "priority_change"`
- If trigger value is non-blank: match only if `event.after.priority == rule.trigger.value`
- If trigger value is blank: match any priority change

### 11.4 `assignee_change`
- Match when `event.eventType == "assignee_change"`
- If trigger value is non-blank: match only if `event.after.assigneeId == rule.trigger.value`
- If trigger value is blank: match any assignee change

---

## 12. Condition evaluation

`AutomationConditionEvaluator` evaluates conditions against `event.after` (post-change state).

All conditions in the list must pass (AND logic).
If conditions list is empty, all triggers match — no filtering.

### 12.1 `status_is`
```
event.after.status.equalsIgnoreCase(condition.value)
```

### 12.2 `priority_is`
```
event.after.priority.equalsIgnoreCase(condition.value)
```

### 12.3 `assignee_is`
```
event.after.assigneeId != null && event.after.assigneeId.equals(condition.value)
```

### 12.4 `label_contains`
```
event.after.labels != null && event.after.labels.contains(condition.value)
```

Comparison rule: use case-insensitive comparison for status and priority. Use exact match for user IDs and labels.

---

## 13. Action execution — `AutomationActionExecutor`

### Critical rule
`AutomationActionExecutor` injects repositories directly.
It does NOT inject `IssueService`.
This prevents re-triggering the automation event listener (see Decision 3).

After every successful action:
1. Save the issue mutation via `issueRepository.save(issue)`
2. Create an `Activity` record via `activityRepository.save(activity)`

### 13.1 `change_status`

```
Load issue from issueRepository
Set issue.status = action.value
Set issue.updatedAt = now
issueRepository.save(issue)
Create activity: "Automation rule '{ruleName}' changed status to '{value}' on {issueKey}"
```

### 13.2 `assign_user`

```
Load issue from issueRepository
Load user from userRepository by action.value (user public id)
If user not found: log warning and skip action
Set issue.assignee = user
Set issue.updatedAt = now
issueRepository.save(issue)
Create activity: "Automation rule '{ruleName}' assigned {userName} to {issueKey}"
```

### 13.3 `add_label`

```
Load issue from issueRepository
If issue.labels does not contain action.value:
    issue.labels.add(action.value)
    issue.updatedAt = now
    issueRepository.save(issue)
    Create activity: "Automation rule '{ruleName}' added label '{value}' to {issueKey}"
If label already present: skip silently (no duplicate, no activity)
```

### 13.4 `send_notification`

Recipient: issue assignee (if present), fallback to issue reporter.
If neither exists: log warning and skip.

```
Determine recipientUserId (assignee first, then reporter)
Create AppNotification:
    recipientUserId = determined above
    title = "Automation: {ruleName}"
    description = "Rule triggered on issue {issueKey}: {issueTitle}"
    type = "automation"
    targetId = issueId
    read = false
    createdAt = now
notificationRepository.save(notification)
```

No activity record needed for `send_notification` — the notification itself is the signal.

---

## 14. Loop protection — full design

### Data structure

```java
public class AutomationExecutionContext {
    private final Set<String> executedRuleIds = new HashSet<>();
    private int depth = 0;
    private final String originIssueId;
    private final int maxDepth; // from config
}
```

Stored in: `ThreadLocal<AutomationExecutionContext>` managed by `AutomationExecutionService`.

### Execution flow with loop protection

```
onAutomationEvent(event):
    context = getOrCreateContext(event.issueId)

    if context.depth >= maxDepth:
        log.warn("Automation max depth reached for issue {}, rule chain stopped", event.issueId)
        return

    context.depth++

    for each matching enabled rule:
        if context.executedRuleIds.contains(rule.id):
            log.debug("Skipping rule {} — already executed in this chain", rule.id)
            continue

        context.executedRuleIds.add(rule.id)

        try:
            evaluate conditions
            execute action
        catch Exception e:
            log.error("Automation rule {} failed on issue {}: {}", rule.id, event.issueId, e.getMessage())
            // continue to next rule — do not abort chain

    context.depth--

    if context.depth == 0:
        clearThreadLocal()  // always in finally block
```

### Config key

Add to `application.properties`:

```properties
app.automation.max-depth=3
```

### Why `ThreadLocal` and not a bean field

Spring beans are singletons. Concurrent requests would share state.
`ThreadLocal` gives each thread (each request) its own independent context.
Always clear it in a `finally` block to prevent memory leaks.

---

## 15. Activity records for automation actions

Every successful automation action (except `send_notification`) must create an `Activity`.

Activity fields:

```
type       = "automation"
actor      = system actor — use a well-known string like "system" or "automation-engine"
targetId   = issueId
targetKey  = issue.key
targetTitle = issue.title
detail     = "Automation rule '{ruleName}' performed '{actionType}' with value '{actionValue}'"
projectId  = event.projectId
createdAt  = now
```

Why this matters:
- users must see when automation changed something
- critical for debugging misconfigured rules
- creates an audit trail distinguishing human vs system changes

---

## 16. Permission model

1. Only users with `MANAGE_PROJECT` permission can create/update/delete automation rules
   — this is already enforced by `AutomationRuleService.ensureManageProjectAccess()`
2. Once a valid rule exists, the automation engine executes it as **system behavior**
3. The activity record uses `actor = "automation"` — not the end user's id
4. Disabled rules (`enabled = false`) must never execute — filter at load time

---

## 17. Failure handling

Automation must fail safely. The user's original action is always the priority.

Rules:
1. `@TransactionalEventListener(phase = AFTER_COMMIT)` ensures the user's update is committed first
2. If one rule throws: log the error, continue to the next rule
3. Never propagate automation exceptions back to the HTTP response
4. Log at ERROR level with: rule id, issue id, exception message, stack trace
5. Partial execution (some rules ran, one failed) is acceptable in Phase 1
6. Do not silently swallow exceptions — always log them

For Phase 1: best-effort execution after persistence is acceptable.
For Phase 2 (future): consider storing execution results in an `automation_executions` table for visibility.

---

## 18. Implementation build order — follow this sequence exactly

### Phase 1: Event model and publishing

Done when:
1. `AutomationEvent` class created with all fields
2. `IssueService` injects `ApplicationEventPublisher`
3. `IssueService.create()` publishes `issue_created` after save
4. `IssueService.update()` publishes change events after save (status/priority/assignee)
5. `IssueService.updateStatus()` publishes `status_change` after save
6. No listener yet — events are published but nothing consumes them
7. Unit tests: verify events are published with correct fields

### Phase 2: `AutomationExecutionService` skeleton

Done when:
1. `AutomationExecutionService` created with `@TransactionalEventListener(phase = AFTER_COMMIT)`
2. `AutomationExecutionContext` and `ThreadLocal` management in place
3. Loop protection logic in place (depth check, rule deduplication, ThreadLocal cleanup)
4. Loads enabled rules via `automationRuleService.findEnabledRulesByProjectId()`
5. No condition evaluation or action execution yet — just loads and logs matched rules
6. Unit tests: verify loop protection stops at max depth, verify disabled rules are skipped

### Phase 3: Trigger matching and condition evaluation

Done when:
1. Trigger matching logic implemented for all four trigger types
2. `AutomationConditionEvaluator` implemented for all four condition types
3. `AutomationExecutionService` calls evaluator before proceeding to action
4. Unit tests: all trigger match cases, all condition cases, empty conditions pass-through

### Phase 4: Action execution

Done when:
1. `AutomationActionExecutor` implemented for all four action types
2. `change_status` updates issue via repository
3. `assign_user` resolves user and updates assignee via repository
4. `add_label` appends label without duplicates via repository
5. `send_notification` creates notification via repository
6. Activity records created for change_status, assign_user, add_label
7. Unit tests: each action type, label duplicate prevention, missing user graceful skip

### Phase 5: Audit and safety hardening

Done when:
1. All activity records include rule name and issue key
2. Failure in one rule does not stop other rules in the chain
3. Max depth log warning is emitted correctly
4. ThreadLocal is always cleared in finally block
5. Integration test: full rule chain from issue update to activity record created

---

## 19. New file list — complete

### Backend — new files

```
src/main/java/com/jeerai/backend/automation/
    AutomationEvent.java
    AutomationExecutionContext.java
    AutomationExecutionService.java
    AutomationConditionEvaluator.java
    AutomationActionExecutor.java
```

### Backend — modified files

```
service/AutomationRuleService.java
    — add findEnabledRulesByProjectId(String projectId)

service/IssueService.java
    — inject ApplicationEventPublisher
    — publish AutomationEvent after create()
    — publish AutomationEvent(s) after update()
    — publish AutomationEvent after updateStatus()

application.properties
    — add app.automation.max-depth=3
```

### Frontend — no changes needed

Frontend is already complete. Do not modify any frontend files for this feature.

---

## 20. Testing plan

### Backend unit tests

1. `AutomationEventPublishingTest`
   - verify `issue_created` event published on create
   - verify `status_change` event published only when status actually changes
   - verify `priority_change` event published only when priority actually changes
   - verify `assignee_change` event published only when assignee actually changes

2. `AutomationConditionEvaluatorTest`
   - `status_is` matches correctly (case-insensitive)
   - `priority_is` matches correctly
   - `assignee_is` matches correctly, handles null assignee
   - `label_contains` matches correctly, handles null labels
   - empty condition list always passes
   - multiple conditions: all must pass

3. `AutomationActionExecutorTest`
   - `change_status` updates issue status and creates activity
   - `assign_user` updates assignee and creates activity
   - `assign_user` with unknown user id logs warning and skips gracefully
   - `add_label` appends label and creates activity
   - `add_label` does NOT duplicate existing label
   - `send_notification` creates notification to assignee
   - `send_notification` falls back to reporter when assignee is null
   - `send_notification` skips gracefully when both are null

4. `AutomationExecutionServiceTest`
   - disabled rule is never executed
   - loop protection: stops at max depth
   - loop protection: skips rule already executed in chain
   - ThreadLocal is cleared after execution completes
   - one failing rule does not stop remaining rules

5. `AutomationIntegrationTest`
   - end-to-end: issue created → matching rule → action executed → activity created
   - end-to-end: issue status changed → condition passes → action executed
   - end-to-end: issue status changed → condition fails → no action executed

### Frontend verification

1. Created rules persist correctly and appear in rule list
2. Toggled-off rules do not produce automation actions after issue updates
3. Activity feed shows automation actions with rule name in detail text
4. Notification appears when `send_notification` action fires

---

## 21. Current limitations to be honest about

- Phase 1 only supports one action per rule (frontend already enforces this)
- No `automation_executions` table yet — execution history not queryable
- Notification recipient is assignee or reporter only — no "notify all members" option
- No retry logic for failed actions in Phase 1
- No UI feedback showing which rules ran after an issue update
- n8n external integrations are explicitly out of scope for this phase

---

## 22. 60-second summary for any team member

JeerAI Automation is a rule-based internal workflow engine. When a user updates an issue, `IssueService` publishes a Spring `ApplicationEvent`. `AutomationExecutionService` listens with `@TransactionalEventListener(phase = AFTER_COMMIT)`, ensuring the user's change is committed before automation runs. It loads all enabled rules for the project, matches triggers, evaluates conditions (AND logic), and executes one action per matching rule directly via repositories — never via `IssueService` — to avoid re-triggering the event listener. Loop protection uses a `ThreadLocal` context tracking execution depth and executed rule IDs per chain. Every automation action creates an activity record with the rule name so users can see what changed and why. One failing rule never stops other rules from running.