# Jeerai Backend

This backend is a Spring Boot REST API for the Jeerai app. If you come from Node/Express, read this file as the backend map: what starts the app, where requests go, how auth works, how data reaches PostgreSQL, which files own what, and what the common startup logs actually mean.

## What This Project Is

Jeerai backend exposes APIs for:

- auth
- workspaces and workspace members
- invitations
- projects
- issues and comments
- sprints
- activities
- notifications
- automation rules
- analytics
- health check
- a placeholder AI endpoint

The app currently runs as a stateless JSON API. Auth is JWT-based. Persistent storage is PostgreSQL in the `postgres` profile. There is also a `mock` profile that swaps the DB-backed repositories for in-memory repositories.

## Node Developer Mental Model

If you are used to Node, this mapping is the fastest way to orient yourself:

- `JeeraiBackendApplication.java`
  - like `server.js` or `app.ts`; bootstraps the whole app
- `controller`
  - like Express route handlers
- `service`
  - like your business/service layer
- `repository`
  - app-level data access contracts
- `repository/jpa`
  - DB-backed implementations using Spring Data JPA
- `entity`
  - DB table mapping classes, similar to ORM models/schemas
- `model`
  - domain objects used by the app outside raw JPA persistence
- `dto`
  - request/response body types
- `config`
  - startup wiring, DB config, CORS, seeding, security setup
- `security`
  - JWT parsing and current-user resolution
- `src/main/resources/db/migration`
  - SQL migrations, similar to Knex/Prisma migration files

## Runtime Stack

These libraries divide the backend-to-database path:

- Spring Boot
  - application framework and autoconfiguration
- Spring Web
  - REST endpoints and JSON serialization
- Spring Security
  - request authorization and filter chain
- Spring Data JPA
  - repository infrastructure
- Hibernate
  - ORM implementation underneath JPA
- HikariCP
  - JDBC connection pool
- PostgreSQL JDBC driver
  - actual driver that talks to Postgres
- Flyway
  - schema migration runner
- JJWT
  - JWT token creation and parsing

Important clarification:

Hibernate is not the whole DB integration. The actual flow is:

`Controller -> Service -> app repository interface -> JPA adapter -> Spring Data JPA repository -> Hibernate -> PostgreSQL JDBC driver -> PostgreSQL`

Separately:

`Flyway -> PostgreSQL`

## Current Configuration

Main runtime config lives in [src/main/resources/application.properties](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/resources/application.properties).

Current important values:

```properties
spring.application.name=jeerai-backend
server.port=3000
spring.config.import=optional:file:./.env.properties
spring.profiles.default=postgres
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/jeerai}
spring.datasource.username=${DB_USER:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
app.security.jwt.secret=${JWT_SECRET:...}
app.security.jwt.expiration=86400000
```

Meaning:

- `server.port=3000`
  - backend listens on port 3000 unless overridden
- `spring.config.import=optional:file:./.env.properties`
  - loads machine-local overrides from `.env.properties` in the backend folder
- `spring.profiles.default=postgres`
  - if you do not explicitly set a profile, DB-backed repositories are used
- `spring.jpa.hibernate.ddl-auto=validate`
  - Hibernate checks schema compatibility; it does not create or alter tables
- `spring.flyway.enabled=true`
  - Flyway applies migrations on startup

## Profiles

Two profiles exist.

### `postgres`

Use this when you want the real PostgreSQL-backed app.

What becomes active:

- [DatabaseConfig.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/config/DatabaseConfig.java)
- all `Jpa...RepositoryAdapter` classes
- all Spring Data JPA repository interfaces in `repository/jpa`
- entity scanning for `com.jeerai.backend.entity`

### `mock`

Use this when you want in-memory data without PostgreSQL.

What becomes active:

- `InMemory...Repository` classes in `repository`
- `MockDataStore`
- `MockDataInitializer` seeding against in-memory repositories

Run mock profile:

```powershell
mvn "-Dspring.profiles.active=mock" spring-boot:run
```

Run postgres profile explicitly:

```powershell
mvn "-Dspring.profiles.active=postgres" spring-boot:run
```

## Local Environment Setup

Create or edit `.env.properties` in the backend root:

```properties
DB_URL=jdbc:postgresql://localhost:5432/jeerai?sslmode=disable&connectTimeout=5&socketTimeout=5
DB_USER=postgres
DB_PASSWORD=root
JWT_SECRET=replace-with-a-real-32-byte-secret-or-base64-value
```

Notes:

- `.env.properties` is optional, but useful for local overrides
- environment variables also work
- do not commit real credentials
- the default JWT secret in `application.properties` is only for local development

## How Startup Works

When you run:

```powershell
mvn spring-boot:run
```

this is the normal startup order:

1. Spring Boot starts the application from `JeeraiBackendApplication`.
2. It resolves config from `application.properties`, `.env.properties`, and environment variables.
3. It determines the active profile. By default here, that becomes `postgres`.
4. It builds the datasource using HikariCP.
5. Flyway validates and applies SQL migrations.
6. JPA starts, Hibernate builds the `EntityManagerFactory`, and repository beans are created.
7. Security filter chain is created.
8. `MockDataInitializer` runs after startup and seeds data only if repositories are empty.
9. Tomcat starts listening on the configured port.

## Common Startup Logs And What They Mean

These are the important log lines you asked about.

### `No active profile set, falling back to 1 default profile: "postgres"`

Normal. It means you did not explicitly activate a profile, so Spring used `spring.profiles.default=postgres`.

### `HikariPool-1 - Start completed`

Good sign. The JDBC connection pool started successfully.

### `Successfully validated ... migrations`

Good sign. Flyway checked the migration history table and validated the SQL files.

### `Schema "public" is up to date. No migration necessary.`

Good sign. Flyway found nothing new to apply.

### `Initialized JPA EntityManagerFactory`

Good sign. Hibernate/JPA startup completed.

### `Database driver: undefined/unknown`

Usually normal in this setup.

Hibernate prints a summary block like:

- database driver
- autocommit mode
- isolation level
- min pool size
- max pool size

When the app uses a pooled datasource like HikariCP, Hibernate does not always get every metadata value through the wrapper, so those fields can show `undefined/unknown`. That is not itself a bug if the datasource already connected successfully.

In your logs, the real health signals are:

- Hikari started
- a PostgreSQL connection was added
- Flyway validated migrations
- Hibernate initialized JPA

So `undefined/unknown` there is normal enough and not the root cause of startup failure.

### `PostgreSQLDialect does not need to be specified explicitly`

Warning only. Spring/Hibernate can auto-detect the dialect, so this property is optional.

### `spring.jpa.open-in-view is enabled by default`

Warning only. It means lazy DB access can still happen during web response rendering. Not fatal.

### `Using generated security password: ...`

Usually a sign that Spring Security default user auto-configuration is still kicking in somewhere. Since this app also has custom JWT auth, treat that as a warning to review security wiring rather than a DB problem.

### `Port XXXX was already in use`

Not a code bug. Another process is already listening on that port.

## Request Lifecycle

For a typical authenticated API request:

1. Request hits Spring MVC.
2. Security filter chain runs first.
3. `JwtAuthenticationFilter` checks `Authorization: Bearer <token>`.
4. `JwtUtil` parses and validates the token.
5. If valid, Spring Security stores the authenticated user in the security context.
6. The controller method runs.
7. Controller calls a service.
8. Service calls one or more repository interfaces.
9. Depending on active profile:
   - `mock`: in-memory repository implementation is used
   - `postgres`: JPA adapter implementation is used
10. Data is returned as DTOs or model objects and serialized to JSON.

## Auth And Security

Security config lives in [SecurityConfig.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/config/SecurityConfig.java).

Current behavior:

- `/auth/**` is public
- `/health` is public
- `/api/**` requires authentication
- everything else is denied
- session mode is stateless
- JWT filter runs before username/password auth filter

JWT pieces:

- [AuthController.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/controller/AuthController.java)
  - exposes `/auth/signup` and `/auth/login`
- [AuthService.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/service/AuthService.java)
  - creates users, verifies passwords, returns token plus user payload
- [JwtAuthenticationFilter.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/security/JwtAuthenticationFilter.java)
  - intercepts requests and validates bearer tokens
- [JwtUtil.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/security/JwtUtil.java)
  - signs and parses JWTs
- `PasswordEncoder`
  - BCrypt hashes passwords

## Persistence Design

This backend intentionally separates domain-facing repositories from the ORM-facing repositories.

### App-level repository interfaces

These live in `src/main/java/com/jeerai/backend/repository`.

Examples:

- `ProjectRepository`
- `IssueRepository`
- `UserRepository`
- `WorkspaceRepository`

These are the interfaces the service layer depends on.

### Mock implementations

Files like:

- `InMemoryProjectRepository`
- `InMemoryIssueRepository`
- `InMemoryUserRepository`

These are active only in the `mock` profile.

### JPA adapters

Files like:

- `JpaProjectRepositoryAdapter`
- `JpaIssueRepositoryAdapter`
- `JpaUserRepositoryAdapter`

These implement the same app-level repository interfaces, but delegate to Spring Data JPA repositories.

### Spring Data JPA repositories

Files like:

- `ProjectJpaRepository`
- `IssueJpaRepository`
- `UserJpaRepository`

These are low-level repository interfaces that Hibernate/Spring Data use to generate actual DB queries.

### `entity` vs `model`

This distinction matters.

- `entity`
  - persistence classes that map to DB tables with JPA annotations
- `model`
  - application/domain objects used by the service layer

The mapper class [JpaRepositoryMapper.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/repository/jpa/JpaRepositoryMapper.java) converts between them.

Why this split exists:

- services do not need to depend directly on JPA entities
- the same service layer can work with both in-memory and JPA-backed repositories
- the code stays closer to a ports-and-adapters style than a pure active-record style

## Seed Data Flow

Seeding is handled by [MockDataInitializer.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/config/MockDataInitializer.java).

What it does:

1. Runs on startup as an `ApplicationRunner`.
2. Checks if users already exist.
3. If users exist, it fills in missing password hashes for seeded users and exits.
4. If users do not exist, it loads `src/main/resources/mock/mock-data.json`.
5. Saves users, projects, sprints, issues, comments, activities, notifications, and automation rules.
6. Creates a default workspace and memberships if needed.
7. Backfills `workspaceId` into projects that do not already have one.

This same initializer works against whichever repository implementation Spring injected for the active profile.

## Database Migrations

Migration files live in `src/main/resources/db/migration`.

Current files:

- `V1__initial_schema.sql`
- `V2__workspace_invitation_system.sql`
- `V3__backfill_user_password_hashes.sql`

Flyway is the source of truth for schema changes.

Because `spring.jpa.hibernate.ddl-auto=validate` is used:

- Hibernate does not create tables
- Hibernate does not auto-migrate schema
- schema changes must be done through Flyway SQL migrations

If you are coming from Prisma or TypeORM, think of Flyway as the migration tool and Hibernate as the ORM/runtime mapper.

## Package Guide

This is the code-reading map.

### Root

- [JeeraiBackendApplication.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/JeeraiBackendApplication.java)
  - application entry point

### `config`

- [DatabaseConfig.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/config/DatabaseConfig.java)
  - activates entity scanning and JPA repositories for `postgres`
- [SecurityConfig.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/config/SecurityConfig.java)
  - defines stateless JWT auth rules
- [WebConfig.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/config/WebConfig.java)
  - configures CORS for local frontend origins on `/api/**`
- [MockDataInitializer.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/config/MockDataInitializer.java)
  - seeds startup data
- [MockDataPayload.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/config/MockDataPayload.java)
  - JSON shape for mock seed data

### `controller`

Controllers are the HTTP layer.

- `AuthController`
  - signup and login
- `WorkspaceController`
  - workspace creation, listing, onboarding, dashboard access
- `WorkspaceMemberController`
  - role updates and member removal
- `InvitationController`
  - create/validate/accept/revoke/expire invitations
- `ProjectController`
  - project reads and updates
- `IssueController`
  - issue CRUD-like operations, status update, comments, random update simulation
- `ActivityController`
  - activity listing and creation
- `AutomationRuleController`
  - automation rule CRUD and enable/disable
- `AnalyticsController`
  - project analytics
- `UserController`
  - user reads
- `SprintController`
  - sprint reads
- `NotificationController`
  - notification reads
- `AiController`
  - placeholder AI message endpoint
- `HealthController`
  - liveness endpoint
- `GlobalExceptionHandler`
  - central JSON error formatting

### `service`

Services contain business rules.

- `AuthService`
  - signup/login flow and JWT response creation
- `WorkspaceService`
  - workspace operations
- `WorkspaceMemberService`
  - membership updates and role rules
- `WorkspaceAccessService`
  - authorization checks around workspace membership
- `InvitationService`
  - invitation lifecycle
- `ProjectService`
  - project business logic
- `IssueService`
  - issue business logic
- `ActivityService`
  - activity operations
- `AutomationRuleService`
  - automation rule operations
- `AnalyticsService`
  - analytics aggregation
- `UserService`
  - user lookups and creation
- `SprintService`
  - sprint queries
- `NotificationService`
  - notification queries
- `AiService`
  - currently a placeholder response
- `InvitationDeliveryService`
  - extension point for sending invitations
- `NoOpInvitationDeliveryService`
  - current no-op implementation

Exception types also live here:

- `BadRequestException`
- `UnauthorizedException`
- `AccessDeniedException`
- `ResourceNotFoundException`

### `repository`

Repository contracts and mock implementations.

- interfaces define the data access API the services expect
- `InMemory...Repository` classes satisfy those interfaces for `mock`
- `MockDataStore` stores in-memory collections

### `repository/jpa`

DB-backed repository layer.

- `...JpaRepository`
  - Spring Data JPA interfaces
- `Jpa...RepositoryAdapter`
  - adapters from app-level repository interfaces to JPA repositories
- `JpaRepositoryMapper`
  - entity/model mapping

### `entity`

JPA persistence objects mapped to tables.

Main entities:

- `UserEntity`
- `WorkspaceEntity`
- `WorkspaceMemberEntity`
- `InvitationEntity`
- `ProjectEntity`
- `SprintEntity`
- `IssueEntity`
- `IssueCommentEntity`
- `ActivityEntity`
- `NotificationEntity`
- `AutomationRuleEntity`

### `model`

Application-facing domain objects.

Main models:

- `User`
- `Workspace`
- `WorkspaceMember`
- `Invitation`
- `Project`
- `Sprint`
- `Issue`
- `IssueComment`
- `Activity`
- `AppNotification`
- `AutomationRule`

### `dto`

HTTP request and response shapes.

Examples:

- `LoginRequest`
- `SignupRequest`
- `AuthResponse`
- `CreateWorkspaceRequest`
- `CreateInvitationRequest`
- `IssueCreateRequest`
- `ProjectDto`
- `WorkspaceDto`
- `ErrorResponse`

### `security`

JWT and current-user support.

- `AuthenticatedUser`
  - simple authenticated principal data
- `CurrentUserProvider`
  - helper to get the current user from Spring Security context
- `JwtAuthenticationEntryPoint`
  - formats unauthorized responses
- `JwtAuthenticationFilter`
  - validates bearer token on each request
- `JwtUtil`
  - token generation and parsing

## API Surface

Public routes:

- `POST /auth/signup`
- `POST /auth/login`
- `GET /health`

Protected routes are under `/api/**`.

Main route groups:

- `/api/workspaces`
- `/api/workspaces/{workspaceId}/members`
- `/api/workspaces/{workspaceId}/invitations`
- `/api/invitations/{token}`
- `/api/projects`
- `/api/issues`
- `/api/activities`
- `/api/automation-rules`
- `/api/analytics`
- `/api/users`
- `/api/sprints`
- `/api/notifications`
- `/api/ai`

## How To Read The Code Fast

If you want the fastest path to understanding the backend, read in this order:

1. [src/main/resources/application.properties](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/resources/application.properties)
2. [JeeraiBackendApplication.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/JeeraiBackendApplication.java)
3. [SecurityConfig.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/config/SecurityConfig.java)
4. [AuthController.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/controller/AuthController.java)
5. [WorkspaceController.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/controller/WorkspaceController.java)
6. one service, such as [WorkspaceService.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/service/WorkspaceService.java)
7. one app repository interface, such as [WorkspaceRepository.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/repository/WorkspaceRepository.java)
8. the active implementation:
   - `mock`: `InMemoryWorkspaceRepository`
   - `postgres`: `JpaWorkspaceRepositoryAdapter` plus `WorkspaceJpaRepository`
9. related `model` and `entity` classes
10. [MockDataInitializer.java](C:/Users/VRAJ%20SHAH/Desktop/jeera/backend/jeerai-backend/src/main/java/com/jeerai/backend/config/MockDataInitializer.java)

## Build And Run

From the backend folder:

```powershell
mvn compile
mvn test
mvn spring-boot:run
```

If port 3000 is already in use:

```powershell
mvn "-Dspring-boot.run.arguments=--server.port=3001" spring-boot:run
```

Health check:

```text
GET http://localhost:3000/health
```

## Known Warnings You May See

- Flyway may warn that PostgreSQL `18.x` is newer than its latest tested version
- Hibernate may print `Database driver: undefined/unknown` and similar metadata lines
- Hibernate may warn that explicitly setting `PostgreSQLDialect` is unnecessary
- Spring may warn that `open-in-view` is enabled
- startup may fail if the configured port is already taken

These warnings are not all equal. The real failures are usually:

- datasource cannot connect
- Flyway migration fails
- required bean is missing because the wrong profile is active
- port already in use

## Current Notes

- backend default port is `3000`
- default profile is `postgres`
- `.env.properties` is the intended local override file
- persistence is DB-backed by default
- `AiService` is currently placeholder logic, not a real AI integration

## Recent Backend Updates

- `POST /api/projects` now exists and creates a project inside the caller's current workspace-admin scope.
- `POST /api/issues/simulate-random-update` no longer returns `404` when no writable issues exist; it now returns `204 No Content`.
- `AnalyticsService` no longer hardcodes completion and velocity demo buckets; those values are now derived from actual project issues and sprints.
- notifications now support persisted read state:
  - `PATCH /api/notifications/{id}/read`
  - `PATCH /api/notifications/read-all`
- notification read/unread status now survives refresh because the backend is the source of truth rather than only frontend store state.
