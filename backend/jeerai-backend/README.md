# Jeerai Backend

Spring Boot backend for the Jeerai app. It exposes REST APIs for projects, issues, activities, analytics, notifications, automation rules, users, sprints, health checks, and a simple AI response endpoint.

## Current Status

What is implemented so far:

- Spring Boot backend is running successfully.
- Backend now starts with PostgreSQL using the `postgres` profile.
- Flyway migration support is wired and the initial schema is applied from `V1__initial_schema.sql`.
- JPA entities and Spring Data repositories are added for database persistence.
- Profile-based repository wiring exists:
  - `mock` profile uses in-memory repositories backed by `mock-data.json`
  - `postgres` profile uses JPA adapter repositories backed by PostgreSQL
- Seed data loading is working:
  - in `mock` profile it loads into in-memory repositories
  - in `postgres` profile it inserts into database-backed repositories when the DB is empty
- Backend is currently configured to run on port `5000`.
- Health endpoint exists at `/health`.

## Tech Stack

- Java 17 source level via Maven compiler config
- Spring Boot `3.5.11`
- Spring Web
- Spring Data JPA
- PostgreSQL
- Flyway
- Spring Security
- Lombok
- Maven

## How The Backend Is Structured

The project follows a standard Spring layered structure:

- `controller`
  - receives HTTP requests and returns HTTP responses
- `service`
  - contains business logic
- `repository`
  - defines app-level repository contracts and in-memory implementations
- `repository/jpa`
  - contains raw Spring Data JPA repositories plus adapter classes that implement the app-level repository interfaces
- `model`
  - plain domain objects used by services and APIs
- `entity`
  - JPA persistence objects mapped to PostgreSQL tables
- `dto`
  - request/response classes for API payloads
- `config`
  - startup, security, data source, and CORS configuration

## Profiles

The backend supports two execution modes.

### `mock` profile

Purpose:
- run the app without PostgreSQL
- use JSON seed data as the data source

How it works:
- `spring.profiles.default=mock` is set in `application.properties`
- `MockDataInitializer` reads `src/main/resources/mock/mock-data.json`
- in-memory repository implementations store and serve the data

### `postgres` profile

Purpose:
- run the app against a real PostgreSQL database

How it works:
- `DatabaseConfig` enables entity scanning and JPA repositories only for the `postgres` profile
- datasource credentials are loaded from `.env.properties` or environment variables
- Flyway validates and migrates the schema
- JPA adapter repositories implement the same repository interfaces used by the services
- `MockDataInitializer` seeds the database when tables are empty

## Run Locally

From the backend folder:

```powershell
cd backend/jeerai-backend
mvn spring-boot:run
```

Current default server port:

- `http://localhost:5000`

## Local Configuration

`src/main/resources/application.properties` contains the shared runtime settings:

- `spring.application.name=jeerai-backend`
- `server.port=5000`
- `spring.config.import=optional:file:./.env.properties`
- `spring.profiles.default=mock`
- datasource and JPA properties for PostgreSQL

`backend/jeerai-backend/.env.properties` is an optional local file used for machine-specific values.

Current example:

```properties
spring.profiles.active=postgres
DB_URL=jdbc:postgresql://localhost:5432/jeerai?sslmode=disable&connectTimeout=5&socketTimeout=5
DB_USER=postgres
DB_PASSWORD=root
```

Important:

- `.env.properties` is local machine config
- do not commit production secrets into it

## PostgreSQL Setup

The PostgreSQL schema is managed by Flyway.

Migration location:

- `src/main/resources/db/migration/V1__initial_schema.sql`

This migration creates:

- `users`
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

## Data Flow

### Request flow

Typical runtime flow:

1. A controller receives the HTTP request.
2. The controller delegates work to a service.
3. The service calls an app-level repository interface such as `ProjectRepository` or `IssueRepository`.
4. The active Spring profile decides which implementation is injected:
   - in-memory repository for `mock`
   - JPA adapter repository for `postgres`
5. The repository returns domain models.
6. The controller returns DTOs or domain objects as JSON.

### Seed data flow

Startup seed flow:

1. `MockDataInitializer` runs at startup.
2. It reads `mock/mock-data.json`.
3. It maps JSON into `MockDataPayload`.
4. It inserts users first.
5. It inserts projects next.
6. It inserts sprints, issues, comments, activities, notifications, and automation rules.

## Important Files And What They Do

This section answers "which file does what task" and "what code means what".

### Entry Point

- `src/main/java/com/jeerai/backend/JeeraiBackendApplication.java`
  - main Spring Boot application entry point
  - starts component scanning and the embedded Tomcat server

### Config Package

- `src/main/java/com/jeerai/backend/config/DatabaseConfig.java`
  - active only in the `postgres` profile
  - enables transaction management
  - tells Spring where to scan JPA entities and Spring Data repositories

- `src/main/java/com/jeerai/backend/config/SecurityConfig.java`
  - configures Spring Security behavior
  - controls which routes are open and which require authentication

- `src/main/java/com/jeerai/backend/config/WebConfig.java`
  - configures cross-origin requests from the frontend
  - mainly used for CORS setup

- `src/main/java/com/jeerai/backend/config/MockDataPayload.java`
  - Java shape used to deserialize `mock-data.json`
  - each field maps to one JSON section like `users`, `projects`, `issues`

- `src/main/java/com/jeerai/backend/config/MockDataInitializer.java`
  - startup seeding class
  - loads the JSON file and saves records through repository interfaces
  - same class works for both `mock` and `postgres` because it only depends on repository abstractions

### Controller Package

- `controller/ProjectController.java`
  - endpoints for reading and updating projects

- `controller/IssueController.java`
  - endpoints for listing issues, reading one issue, creating issues, updating issues, comments, and simulation

- `controller/ActivityController.java`
  - endpoints for listing activities and generating activity records from issue updates

- `controller/AutomationRuleController.java`
  - endpoints for CRUD operations on automation rules

- `controller/AnalyticsController.java`
  - endpoint for project analytics aggregation

- `controller/UserController.java`
  - endpoints for reading users

- `controller/SprintController.java`
  - endpoints for reading sprints

- `controller/NotificationController.java`
  - endpoints for reading notifications

- `controller/AiController.java`
  - endpoint for the simple AI message flow

- `controller/HealthController.java`
  - lightweight health check at `/health`
  - returns a small JSON object with status and timestamp

- `controller/GlobalExceptionHandler.java`
  - central exception-to-response mapper
  - converts backend exceptions into consistent error JSON

### Service Package

- `service/ProjectService.java`
  - project lookup, sorting, update logic, DTO conversion

- `service/IssueService.java`
  - core issue business logic
  - creates issues
  - updates fields dynamically
  - handles comments
  - simulates random issue state changes

- `service/ActivityService.java`
  - retrieves activities and creates activity items linked to issues

- `service/AutomationRuleService.java`
  - business logic for rule create, update, toggle, fetch, and delete

- `service/AnalyticsService.java`
  - aggregates issue data into analytics output used by dashboards

- `service/UserService.java`
  - user retrieval logic

- `service/SprintService.java`
  - sprint retrieval logic

- `service/NotificationService.java`
  - notification retrieval logic

- `service/AiService.java`
  - generates simple AI-like responses for the app

- `service/ResourceNotFoundException.java`
  - custom exception used when a requested entity does not exist

### Model Package

These are the app's domain models. Services and controllers mainly work with these.

- `model/User.java`
  - user id, name, email

- `model/Project.java`
  - project id, key, name, description, lead, members, timestamps

- `model/Sprint.java`
  - sprint metadata and active flag

- `model/Issue.java`
  - issue metadata, assignee, reporter, labels, project link, sprint link

- `model/IssueComment.java`
  - comment id, issue link, author, content, created timestamp

- `model/Activity.java`
  - activity feed entry for issue/project actions

- `model/AppNotification.java`
  - notification object shown to the user

- `model/AutomationRule.java`
  - automation rule plus nested trigger/action/condition value objects

### Entity Package

These classes represent database tables and relationships when running with PostgreSQL.

- `entity/UserEntity.java`
  - maps to `users`

- `entity/ProjectEntity.java`
  - maps to `projects`
  - includes lead relationship and project members join table

- `entity/SprintEntity.java`
  - maps to `sprints`
  - linked to a project

- `entity/IssueEntity.java`
  - maps to `issues`
  - linked to project, sprint, assignee, reporter, and labels collection

- `entity/IssueCommentEntity.java`
  - maps to `issue_comments`
  - linked to issue and author

- `entity/ActivityEntity.java`
  - maps to `activities`
  - linked to actor and project

- `entity/NotificationEntity.java`
  - maps to `notifications`

- `entity/AutomationRuleEntity.java`
  - maps to `automation_rules`
  - also stores rule conditions in `automation_rule_conditions`

### Repository Package

These interfaces are the abstraction layer used by services.

- `repository/ProjectRepository.java`
- `repository/UserRepository.java`
- `repository/SprintRepository.java`
- `repository/IssueRepository.java`
- `repository/ActivityRepository.java`
- `repository/NotificationRepository.java`
- `repository/AutomationRuleRepository.java`

What these mean:

- they define the operations the app needs
- services depend on these interfaces instead of depending directly on JPA or in-memory storage
- this makes switching between `mock` and `postgres` possible without rewriting service logic

In-memory implementations:

- `InMemoryProjectRepository.java`
- `InMemoryUserRepository.java`
- `InMemorySprintRepository.java`
- `InMemoryIssueRepository.java`
- `InMemoryActivityRepository.java`
- `InMemoryNotificationRepository.java`
- `InMemoryAutomationRuleRepository.java`

- `repository/MockDataStore.java`
  - central in-memory storage object used by the `mock` profile repositories

### JPA Repository Package

This package has two types of classes.

Raw Spring Data repositories:

- `UserJpaRepository.java`
- `ProjectJpaRepository.java`
- `SprintJpaRepository.java`
- `IssueJpaRepository.java`
- `IssueCommentJpaRepository.java`
- `ActivityJpaRepository.java`
- `NotificationJpaRepository.java`
- `AutomationRuleJpaRepository.java`

What these do:

- extend `JpaRepository`
- execute actual DB access against entities
- support lookups like `findByPublicId(...)` and project-scoped queries

Adapter repositories:

- `JpaUserRepositoryAdapter.java`
- `JpaProjectRepositoryAdapter.java`
- `JpaSprintRepositoryAdapter.java`
- `JpaIssueRepositoryAdapter.java`
- `JpaActivityRepositoryAdapter.java`
- `JpaNotificationRepositoryAdapter.java`
- `JpaAutomationRuleRepositoryAdapter.java`

What these do:

- implement the app-level repository interfaces
- delegate to Spring Data JPA repositories
- convert between domain models and JPA entities

- `JpaRepositoryMapper.java`
  - central mapping class between `model/*` and `entity/*`
  - this file is the bridge between API/business objects and DB persistence objects

### DTO Package

DTO means Data Transfer Object. These classes represent API request and response shapes.

Examples:

- `IssueCreateRequest.java`
  - body used when creating an issue

- `IssueStatusUpdateRequest.java`
  - body used when updating issue status

- `AddCommentRequest.java`
  - body used when adding a comment

- `ProjectDto.java`
  - response shape for project data

- `ProjectUpdateRequest.java`
  - request shape for project updates

- `AnalyticsDataDto.java`
  - analytics response structure

- `AiMessageRequest.java` and `AiMessageResponse.java`
  - request/response for the AI endpoint

- `ErrorResponse.java`
  - standardized error response body

## Resource Files

- `src/main/resources/application.properties`
  - global Spring configuration
  - port, profiles, datasource, JPA, config import

- `src/main/resources/application-mock.properties`
  - mock-profile-specific properties if needed by the app

- `src/main/resources/mock/mock-data.json`
  - seed dataset for users, projects, sprints, issues, comments, activities, notifications, automation rules

- `src/main/resources/db/migration/V1__initial_schema.sql`
  - first Flyway SQL migration

## API Summary

Base path:

- `/api`

Current endpoint groups:

- `/api/projects`
- `/api/issues`
- `/api/activities`
- `/api/automation-rules`
- `/api/analytics/projects/{projectId}`
- `/api/users`
- `/api/sprints`
- `/api/notifications`
- `/api/ai/message`
- `/health`

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

## Current Warnings You May See

These are currently warnings, not blockers:

- Flyway warns that PostgreSQL `18.3` is newer than the latest tested version in the current Flyway release
- Hibernate warns that `spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect` is not strictly required
- Spring may warn that `open-in-view` is enabled by default
- Spring Security prints a generated development password if default auth is active

## Short Mental Model

If you want to understand the code quickly, use this order:

1. `JeeraiBackendApplication.java`
2. `application.properties`
3. `config/DatabaseConfig.java`
4. one controller such as `IssueController.java`
5. matching service such as `IssueService.java`
6. repository interface such as `IssueRepository.java`
7. active implementation:
   - `InMemoryIssueRepository.java` for `mock`
   - `JpaIssueRepositoryAdapter.java` and `IssueJpaRepository.java` for `postgres`
8. related models/entities:
   - `model/Issue.java`
   - `entity/IssueEntity.java`

That path explains almost the whole architecture.
