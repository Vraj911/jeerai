# Jeerai Backend

Spring Boot backend for the Jeerai app. It exposes REST APIs for projects, issues, activities, analytics, notifications, automation rules, users, sprints, health checks, and a simple placeholder AI response endpoint.

## Current Status

Implemented so far:

- Spring Boot app starts successfully.
- Backend runs on port `5000`.
- Two runtime profiles are supported:
  - `mock` uses in-memory repositories with `mock-data.json`
  - `postgres` uses PostgreSQL through JPA adapter repositories
- Flyway migration support is enabled and migrations `V1__initial_schema.sql` and `V2__workspace_invitation_system.sql` are applied on startup.
- JPA entities and Spring Data JPA repositories are wired for persistence.
- Seed data loading works through the same repository abstraction in both profiles.
- Workspace-based collaboration is implemented:
  - workspace creation
  - owner/admin invitation flow with tokenized links
  - invitation accept/expire/revoke flow
  - workspace membership and role management
  - onboarding and dashboard access checks
- Health endpoint exists at `/health`.
- Spring Security is present, but current config allows all routes for development.

## Tech Stack

- Java 17 source level via Maven compiler config
- Spring Boot `3.5.11`
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- Lombok
- Maven

## Architecture

The project uses a standard layered Spring structure:

- `controller`
  - HTTP entry points
- `service`
  - business logic
- `repository`
  - app-level repository contracts and in-memory implementations
- `repository/jpa`
  - Spring Data JPA repositories and adapters that implement app-level repository interfaces
- `model`
  - domain objects used by services and API responses
- `entity`
  - JPA persistence classes mapped to PostgreSQL tables
- `dto`
  - request and response payloads
- `config`
  - database, security, CORS, and startup seeding configuration

New collaboration domain:

- `Workspace`
  - tenant boundary for projects and members
- `WorkspaceMember`
  - user membership plus role in a workspace
- `Invitation`
  - tokenized invite with status and expiry

## Profiles

The backend supports two execution modes.

### `mock`

Purpose:

- run without PostgreSQL
- serve data from JSON-backed in-memory repositories

How it works:

- `spring.profiles.default=mock` is set in `src/main/resources/application.properties`
- `MockDataInitializer` reads `src/main/resources/mock/mock-data.json`
- in-memory repositories store the loaded data in `MockDataStore`

### `postgres`

Purpose:

- run against a real PostgreSQL database

How it works:

- `DatabaseConfig` is active only in the `postgres` profile
- datasource values come from `.env.properties` or environment variables
- Flyway validates and migrates the schema
- JPA adapter repositories implement the same repository interfaces used by services
- `MockDataInitializer` seeds the database only when repositories are empty

## Run Locally

From the backend folder:

```powershell
cd backend/jeerai-backend
mvn spring-boot:run
```

App URL:

- `http://localhost:5000`

Health check:

- `http://localhost:5000/health`

## Local Configuration

Shared runtime settings live in `src/main/resources/application.properties`.

Current important properties:

```properties
spring.application.name=jeerai-backend
server.port=5000
spring.config.import=optional:file:./.env.properties
spring.profiles.default=mock
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
```

Optional local machine config can be placed in:

- `backend/jeerai-backend/.env.properties`

Example:

```properties
spring.profiles.active=postgres
DB_URL=jdbc:postgresql://localhost:5432/jeerai?sslmode=disable&connectTimeout=5&socketTimeout=5
DB_USER=postgres
DB_PASSWORD=root
```

Notes:

- `.env.properties` is local-only config
- do not commit production secrets
- if `.env.properties` activates `postgres`, tests will also start with that profile unless overridden

## PostgreSQL Setup

Schema migrations are managed by Flyway.

Migration file:

- `src/main/resources/db/migration/V1__initial_schema.sql`
- `src/main/resources/db/migration/V2__workspace_invitation_system.sql`

Current schema creates:

- `users`
- `workspaces`
- `workspace_members`
- `invitations`
- `projects`
- `project_members`
- `sprints`
- `issues`
- `issue_labels`
- `issue_comments`
- `activities`
- `notifications`
- `automation_rules`
- `automation_rule_conditions`

## Request Flow

Typical request path:

1. A controller receives the HTTP request.
2. The controller delegates to a service.
3. The service calls an app-level repository interface.
4. Spring injects either the in-memory implementation or the JPA adapter depending on the active profile.
5. The repository returns domain models.
6. The controller returns JSON.

## Seed Data Flow

Startup seed path:

1. `MockDataInitializer` runs at startup.
2. It loads `mock/mock-data.json`.
3. It maps JSON into `MockDataPayload`.
4. It inserts users first.
5. It inserts projects, then sprints, issues, comments, activities, notifications, and automation rules.
6. It creates a default workspace and membership set when no workspace exists yet.
7. It skips seeding when users already exist.

## Key Files

### Entry Point

- `src/main/java/com/jeerai/backend/JeeraiBackendApplication.java`
  - Spring Boot application entry point

### Config

- `src/main/java/com/jeerai/backend/config/DatabaseConfig.java`
  - enables entity scanning and JPA repositories only for `postgres`
- `src/main/java/com/jeerai/backend/config/SecurityConfig.java`
  - disables CSRF and currently permits all requests
- `src/main/java/com/jeerai/backend/config/WebConfig.java`
  - enables CORS for localhost frontend origins on `/api/**`
- `src/main/java/com/jeerai/backend/config/MockDataPayload.java`
  - deserialization shape for `mock-data.json`
- `src/main/java/com/jeerai/backend/config/MockDataInitializer.java`
  - seeds repositories at startup

### Controllers

- `controller/ProjectController.java`
  - project read and update endpoints
- `controller/IssueController.java`
  - issue listing, create, patch, status update, comments, and simulated random update
- `controller/ActivityController.java`
  - activity listing and activity creation
- `controller/AutomationRuleController.java`
  - automation rule CRUD and toggle endpoints
- `controller/AnalyticsController.java`
  - project analytics endpoint
- `controller/UserController.java`
  - user read endpoints
- `controller/SprintController.java`
  - sprint read endpoints
- `controller/NotificationController.java`
  - notification read endpoints
- `controller/AiController.java`
  - simple AI message endpoint
- `controller/HealthController.java`
  - `/health` endpoint with status and timestamp
- `controller/GlobalExceptionHandler.java`
  - maps not-found, bad-request, and access-denied exceptions to structured error JSON
- `controller/WorkspaceController.java`
  - workspace create, list, onboarding, member listing, and dashboard access endpoints
- `controller/WorkspaceMemberController.java`
  - workspace member role update and member removal endpoints
- `controller/InvitationController.java`
  - invitation create, validate, accept, expire, revoke, and listing endpoints

### Services

- `service/ProjectService.java`
- `service/IssueService.java`
- `service/ActivityService.java`
- `service/AutomationRuleService.java`
- `service/AnalyticsService.java`
- `service/UserService.java`
- `service/SprintService.java`
- `service/NotificationService.java`
- `service/AiService.java`
- `service/WorkspaceService.java`
- `service/WorkspaceMemberService.java`
- `service/InvitationService.java`
- `service/InvitationDeliveryService.java`
- `service/NoOpInvitationDeliveryService.java`
- `service/ResourceNotFoundException.java`

`AiService` is currently a placeholder that returns `"AI response to: <message>"`.

`InvitationDeliveryService` is the extension point for future async email delivery. The current implementation is intentionally a no-op logger.

### Repository Layers

App-level repository contracts:

- `repository/ProjectRepository.java`
- `repository/UserRepository.java`
- `repository/SprintRepository.java`
- `repository/IssueRepository.java`
- `repository/ActivityRepository.java`
- `repository/NotificationRepository.java`
- `repository/AutomationRuleRepository.java`
- `repository/WorkspaceRepository.java`
- `repository/WorkspaceMemberRepository.java`
- `repository/InvitationRepository.java`

In-memory implementations:

- `InMemoryProjectRepository.java`
- `InMemoryUserRepository.java`
- `InMemorySprintRepository.java`
- `InMemoryIssueRepository.java`
- `InMemoryActivityRepository.java`
- `InMemoryNotificationRepository.java`
- `InMemoryAutomationRuleRepository.java`
- `InMemoryWorkspaceRepository.java`
- `InMemoryWorkspaceMemberRepository.java`
- `InMemoryInvitationRepository.java`
- `repository/MockDataStore.java`

JPA repositories and adapters:

- raw repositories:
  - `UserJpaRepository.java`
  - `ProjectJpaRepository.java`
  - `SprintJpaRepository.java`
  - `IssueJpaRepository.java`
  - `IssueCommentJpaRepository.java`
  - `ActivityJpaRepository.java`
  - `NotificationJpaRepository.java`
  - `AutomationRuleJpaRepository.java`
  - `WorkspaceJpaRepository.java`
  - `WorkspaceMemberJpaRepository.java`
  - `InvitationJpaRepository.java`
- adapters:
  - `JpaUserRepositoryAdapter.java`
  - `JpaProjectRepositoryAdapter.java`
  - `JpaSprintRepositoryAdapter.java`
  - `JpaIssueRepositoryAdapter.java`
  - `JpaActivityRepositoryAdapter.java`
  - `JpaNotificationRepositoryAdapter.java`
  - `JpaAutomationRuleRepositoryAdapter.java`
  - `JpaWorkspaceRepositoryAdapter.java`
  - `JpaWorkspaceMemberRepositoryAdapter.java`
  - `JpaInvitationRepositoryAdapter.java`
- mapper:
  - `JpaRepositoryMapper.java`

## API Summary

Base paths:

- `/api`
- `/health`

Current endpoint groups:

- `/api/projects`
- `/api/issues`
- `/api/activities`
- `/api/automation-rules`
- `/api/analytics/projects/{projectId}`
- `/api/users`
- `/api/workspaces`
- `/api/invitations/{token}`
- `/api/sprints`
- `/api/notifications`
- `/api/ai/message`
- `/health`

Notable endpoint behaviors:

- `GET /api/issues?projectId=...` filters issues by project
- `GET /api/activities?projectId=...` filters activities by project
- `GET /api/automation-rules?projectId=...` requires `projectId`
- `PATCH /api/automation-rules/{id}/toggle?enabled=true|false` toggles rule state
- `POST /api/issues/simulate-random-update` triggers the random issue update flow
- `POST /api/workspaces` creates a workspace and assigns the creator as `OWNER`
- `GET /api/workspaces?userId=...` lists the workspaces a user belongs to
- `GET /api/workspaces/onboarding?userId=...` returns whether the user should see onboarding
- `GET /api/workspaces/{workspaceId}/dashboard-access?userId=...` checks dashboard access
- `POST /api/workspaces/{workspaceId}/invitations` creates tokenized invitations for `ADMIN`, `MEMBER`, or `VIEWER`
- `GET /api/invitations/{token}` validates an invitation token
- `POST /api/invitations/{token}/accept` accepts an invitation and creates membership
- `PATCH /api/workspaces/{workspaceId}/members/{memberId}/role` allows owners to change workspace roles

## Build And Test

Compile:

```powershell
cd backend/jeerai-backend
mvn compile
```

Run tests:

```powershell
mvn test
```

Run app:

```powershell
mvn spring-boot:run
```

Current local verification:

- `mvn test` passes in this workspace
- `mvn "-Dspring.profiles.active=mock" test` also passes

## Current Warnings

You may still see these warnings locally:

- Flyway warns that PostgreSQL `18.3` is newer than its latest tested version
- Hibernate warns that explicitly setting `PostgreSQLDialect` is unnecessary
- Spring warns that `open-in-view` is enabled by default
- Spring Security may print a generated development password because the default in-memory user config is still active
- Mockito prints a dynamic agent warning on newer JDKs during tests

## Quick Code Reading Order

If you want to understand the backend quickly, use this order:

1. `JeeraiBackendApplication.java`
2. `application.properties`
3. `config/DatabaseConfig.java`
4. one controller such as `IssueController.java`
5. the matching service such as `IssueService.java`
6. the repository interface such as `IssueRepository.java`
7. the active implementation:
   - `InMemoryIssueRepository.java` for `mock`
   - `JpaIssueRepositoryAdapter.java` and `IssueJpaRepository.java` for `postgres`
8. the related domain and entity classes:
   - `model/Issue.java`
   - `entity/IssueEntity.java`

## README Update In This Pass

This README was updated to:

- align the documentation with the current source tree
- reflect the actual controller mappings and runtime behavior
- document current security behavior and local test behavior
- note that the AI endpoint is still a placeholder response
- document the new workspace invitation and role-based access system
