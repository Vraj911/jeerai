# GitHub + Slack End-to-End Integration Plan (JeerAI)

## 1. What exists right now (repo analysis)

### Frontend
- Integration UI exists only as mock switches in frontend/src/pages/project/ProjectSettings.tsx.
- GitHub and Slack are currently local UI state only (no API calls).
- No integration API client exists under frontend/src/api.
- No integration query hooks exist under frontend/src/queries.

### Backend
- No GitHub or Slack integration controller/service/repository currently exists.
- Existing backend architecture uses:
  - controller + service + model + repository interface
  - dual repository implementations (in-memory + JPA adapter)
  - Flyway migrations for schema evolution
- Authorization is already enforced via workspace/project services and project permissions.
- Security currently permits only auth/health/invite validation without JWT.

## 2. Target result

Implement full-stack, production-ready integration channels for GitHub and Slack so each project can:
- Connect/disconnect provider accounts/workspaces
- Persist integration status per project
- Receive provider webhooks securely
- Trigger outbound channel actions (notifications/events)
- Show real connection state in Project Settings UI

## 3. Backend work breakdown

## Phase A: Data model and migration

Create Flyway migration V6 (or next number) with these tables:

1. integration_connections
- id (uuid PK)
- public_id (varchar unique)
- workspace_id (fk workspaces.id)
- project_id (fk projects.id)
- provider (enum-like varchar: GITHUB, SLACK)
- status (ACTIVE, DISCONNECTED, ERROR, PENDING)
- external_workspace_id (GitHub org id / Slack team id)
- external_workspace_name
- connected_by_user_id (fk users.id)
- connected_at
- updated_at

2. integration_secrets
- id (uuid PK)
- connection_id (fk integration_connections.id)
- secret_type (ACCESS_TOKEN, REFRESH_TOKEN, WEBHOOK_SECRET, BOT_TOKEN)
- encrypted_value (text)
- created_at
- updated_at

3. integration_subscriptions
- id (uuid PK)
- connection_id (fk integration_connections.id)
- channel_key (example: slack:#backend-alerts, github:repo:owner/name)
- event_type (ISSUE_CREATED, ISSUE_UPDATED, SPRINT_STARTED, etc.)
- enabled (boolean)
- created_at

4. integration_event_inbox
- id (uuid PK)
- provider
- external_event_id (for idempotency)
- payload_json (text/json)
- signature_valid (boolean)
- received_at
- processed_at
- status (RECEIVED, PROCESSED, FAILED)
- error_message

Indexes to add:
- unique(provider, external_event_id) on integration_event_inbox
- idx by project_id/provider/status on integration_connections
- idx by connection_id/event_type on integration_subscriptions

Notes:
- Keep DB token values encrypted before save.
- Do not store raw OAuth secrets in plain text.

## Phase B: Domain + repository layer

Follow existing repository pattern:

1. Add model classes
- IntegrationConnection
- IntegrationSecret
- IntegrationSubscription
- IntegrationEventInbox

2. Add entity classes
- IntegrationConnectionEntity
- IntegrationSecretEntity
- IntegrationSubscriptionEntity
- IntegrationEventInboxEntity

3. Add repository interfaces
- IntegrationConnectionRepository
- IntegrationSecretRepository
- IntegrationSubscriptionRepository
- IntegrationEventInboxRepository

4. Add implementations
- InMemory* repositories for mock/local profile compatibility
- Jpa*RepositoryAdapter + Spring Data JpaRepository interfaces

5. Add mapper methods in adapters
- entity <-> model conversion
- provider enum/string conversion

## Phase C: Service layer

Create integration services:

1. IntegrationConnectionService
- createOAuthState(projectId, provider)
- connectFromCallback(provider, code, state)
- disconnect(projectId, provider)
- getProjectIntegrations(projectId)

2. GitHubIntegrationService
- exchange OAuth code for token
- fetch org/repo metadata
- create/list webhook settings
- verify webhook signature (X-Hub-Signature-256)

3. SlackIntegrationService
- exchange OAuth code for bot token
- fetch team/channel metadata
- verify Slack signature (X-Slack-Signature + timestamp)
- handle URL verification challenge

4. IntegrationEventProcessorService
- persist incoming webhook in inbox table
- idempotency check
- map provider events -> internal integration events
- publish to app notification/activity flow

5. IntegrationDispatchService
- outbound Slack notifications to configured channels
- optional GitHub actions (issue comment/status sync) as separate strategy

## Phase D: REST APIs

Add new controller(s):
- ProjectIntegrationController (project-scoped operations)
- IntegrationWebhookController (public webhook endpoints)

### Project-scoped endpoints (JWT required)
- GET /api/projects/{projectId}/integrations
- POST /api/projects/{projectId}/integrations/github/connect-url
- POST /api/projects/{projectId}/integrations/slack/connect-url
- POST /api/projects/{projectId}/integrations/{provider}/disconnect
- GET /api/projects/{projectId}/integrations/{provider}/subscriptions
- PATCH /api/projects/{projectId}/integrations/{provider}/subscriptions

### Callback/webhook endpoints (public, signature validated)
- GET /api/integrations/github/callback
- GET /api/integrations/slack/callback
- POST /api/integrations/github/webhook
- POST /api/integrations/slack/events

SecurityConfig updates required:
- permit callback/webhook routes without JWT
- keep all project management routes under /api/projects/** authenticated

## Phase E: AuthZ and tenant boundaries

For every project integration write operation:
- Require MANAGE_PROJECT permission via WorkspaceAccessService.canCurrentUser(projectId, MANAGE_PROJECT)

For read operations:
- Require project read access

For webhook processing:
- Resolve project/connection by verified provider metadata
- Reject events that cannot be mapped to an active connection

## Phase F: Config and secrets

Add app properties (env-backed):

GitHub
- app.integration.github.client-id
- app.integration.github.client-secret
- app.integration.github.oauth-scope
- app.integration.github.webhook-secret

Slack
- app.integration.slack.client-id
- app.integration.slack.client-secret
- app.integration.slack.bot-scope
- app.integration.slack.signing-secret

General
- app.integration.oauth.redirect-base-url
- app.integration.secret-encryption-key

Add entries to backend .env.properties.example documentation if present; otherwise update backend README config section.

## Phase G: Frontend wiring (replace mocks)

Update existing integration tab in frontend/src/pages/project/ProjectSettings.tsx:

1. Replace local integrations state with backend data.
2. Add integration API file:
- frontend/src/api/integration.api.ts

3. Add query hooks:
- frontend/src/queries/integration.queries.ts

4. UX behavior
- Connect button opens backend-generated OAuth URL
- Disconnect calls backend endpoint
- Show connected account/team/channel metadata
- Show last sync/error status

5. Keep project permission behavior aligned:
- Disable connect/disconnect controls for non-manage users

## Phase H: Triggering channel events from existing domain logic

Hook into existing flows:
- IssueService create/update/comment events
- Sprint state changes
- AutomationRule execution results

Implementation pattern:
1. Emit internal app event from service layer (or direct integration dispatch call initially).
2. Resolve enabled subscriptions for that project.
3. Dispatch to Slack/GitHub channel adapter.
4. Record delivery status for retries/diagnostics.

## Phase I: Reliability and observability

1. Add retry policy for outbound provider calls (exponential backoff).
2. Add dead-letter/error status in integration_event_inbox.
3. Add structured logs with correlation id and provider event id.
4. Add lightweight metrics counters:
- integration_webhook_received_total
- integration_webhook_invalid_signature_total
- integration_dispatch_success_total
- integration_dispatch_failure_total

## Phase J: Testing plan

Add tests in backend/src/test/java/com/jeerai/backend:

1. Service integration tests
- connect/disconnect flow with mock provider clients
- permission denied scenarios
- project/workspace isolation

2. Controller tests
- callback endpoints and webhook endpoints
- signature validation failure cases
- idempotent webhook replay

3. Migration test
- Flyway migration applies on H2 test profile

4. Frontend tests
- integration tab loads real API state
- connect/disconnect mutations update UI

## 4. Suggested implementation order (safest path)

1. DB migration + models/entities + repositories
2. Read-only GET integrations endpoint
3. Connect URL + callback flow for Slack first
4. Connect URL + callback flow for GitHub
5. Webhook ingestion + signature verification
6. Outbound dispatch (Slack notifications first)
7. Frontend replacement of mock toggles
8. Tests + hardening + docs

## 5. Minimum viable scope (if you want fastest delivery)

MVP should include:
- Per-project connect/disconnect for Slack and GitHub
- Persisted connection status
- Secure webhook ingestion and idempotency
- Slack channel notification for issue events
- UI reflects true connected status

Can be deferred to v2:
- Rich GitHub bidirectional sync
- Multi-channel per provider advanced routing
- Retry dashboard and admin observability UI

## 6. Concrete file creation checklist

Backend new files (expected):
- src/main/java/com/jeerai/backend/controller/ProjectIntegrationController.java
- src/main/java/com/jeerai/backend/controller/IntegrationWebhookController.java
- src/main/java/com/jeerai/backend/service/IntegrationConnectionService.java
- src/main/java/com/jeerai/backend/service/GitHubIntegrationService.java
- src/main/java/com/jeerai/backend/service/SlackIntegrationService.java
- src/main/java/com/jeerai/backend/service/IntegrationEventProcessorService.java
- src/main/java/com/jeerai/backend/model/*Integration*.java
- src/main/java/com/jeerai/backend/entity/*Integration*.java
- src/main/java/com/jeerai/backend/repository/*Integration*.java
- src/main/java/com/jeerai/backend/repository/jpa/*Integration*.java
- src/main/resources/db/migration/V6__integration_channels.sql (or next version)

Frontend new/updated files:
- src/api/integration.api.ts
- src/queries/integration.queries.ts
- src/pages/project/ProjectSettings.tsx
- src/types/project.ts (or new src/types/integration.ts)

## 7. Definition of done

Feature is done only when:
- Project settings no longer uses mock integration state
- GitHub and Slack can be connected/disconnected per project
- Webhooks are validated and persisted idempotently
- At least one real outbound channel notification works (Slack)
- Permission model is enforced for integration management
- Automated tests cover connect/disconnect + webhook verification paths
