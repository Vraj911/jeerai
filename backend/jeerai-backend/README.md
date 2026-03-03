# Jeerai Backend

Spring Boot backend for Jeera2.

## Overview

This backend serves all app data through REST APIs.

Key point:

- Mock data is centralized in one JSON file:
  - `src/main/resources/mock/mock-data.json`
- On startup, `MockDataInitializer` loads this JSON into in-memory stores.
- Frontend calls backend APIs only (no direct frontend mock files).

## Tech Stack

- Java 17
- Spring Boot 3.5.11
- Spring Web
- Spring Security (currently open for `/api/**`)
- Lombok
- Maven

## Run Locally

```bash
cd backend/jeerai-backend
mvn spring-boot:run
```

Default URL:

- `http://localhost:8080`

## Build

```bash
cd backend/jeerai-backend
mvn -DskipTests compile
```

## Mock Data Loading Flow

1. `src/main/resources/mock/mock-data.json` stores all mock entities.
2. `MockDataPayload` maps JSON sections into Java objects.
3. `MockDataInitializer` loads payload at startup.
4. Data is inserted into:
   - `MockDataStore` (all domains)
   - `ProjectRepository` (project endpoints compatibility)

## API Summary

Base path: `/api`

- `/api/projects`
- `/api/issues`
- `/api/activities`
- `/api/automation-rules`
- `/api/analytics/projects/{projectId}`
- `/api/users`
- `/api/sprints`
- `/api/notifications`
- `/api/ai/message`

## What Is In Which File

This section is a quick map of important files and what they implement.

### Entry + Config

- `src/main/java/com/jeerai/backend/JeeraiBackendApplication.java`
  - Spring Boot app entry point.
- `src/main/java/com/jeerai/backend/config/SecurityConfig.java`
  - Security filter chain; currently allows `/api/**` without auth.
- `src/main/java/com/jeerai/backend/config/WebConfig.java`
  - CORS config for frontend origins.
- `src/main/java/com/jeerai/backend/config/MockDataPayload.java`
  - JSON-binding structure for `mock-data.json`.
- `src/main/java/com/jeerai/backend/config/MockDataInitializer.java`
  - Startup loader that reads JSON and seeds in-memory stores.

### Controllers (HTTP layer)

- `controller/ProjectController.java`
  - Project read + partial update endpoints.
- `controller/IssueController.java`
  - Issue endpoints, status update, comments, random simulation.
- `controller/ActivityController.java`
  - Activity list + create endpoints.
- `controller/AutomationRuleController.java`
  - Automation rule list/create/update/delete/toggle.
- `controller/AnalyticsController.java`
  - Project analytics response endpoint.
- `controller/UserController.java`
  - User list endpoint.
- `controller/SprintController.java`
  - Sprint list endpoint.
- `controller/NotificationController.java`
  - Notification list endpoint.
- `controller/AiController.java`
  - AI message endpoint (`/api/ai/message`).
- `controller/GlobalExceptionHandler.java`
  - Maps backend exceptions to structured error responses.

### Services (business logic)

- `service/ProjectService.java`
  - Project sorting, lookup, update logic, DTO mapping.
- `service/IssueService.java`
  - Issue creation/update logic, comment logic, random issue mutation.
- `service/ActivityService.java`
  - Activity retrieval and activity generation from issue changes.
- `service/AutomationRuleService.java`
  - Rule create/update/toggle/delete behavior.
- `service/AnalyticsService.java`
  - Aggregates issue data into analytics DTO buckets.
- `service/UserService.java`
  - User retrieval logic.
- `service/SprintService.java`
  - Sprint retrieval logic.
- `service/NotificationService.java`
  - Notification retrieval logic.
- `service/AiService.java`
  - Simple AI response generation logic.
- `service/ResourceNotFoundException.java`
  - Domain-level 404 exception.

### Repositories / Storage

- `repository/MockDataStore.java`
  - Main in-memory storage for users, projects, sprints, issues, comments, activities, rules, notifications.
- `repository/ProjectRepository.java`
  - Project repository interface.
- `repository/InMemoryProjectRepository.java`
  - In-memory implementation for project repository.

### Models (domain objects)

- `model/User.java`, `model/Project.java`, `model/Sprint.java`
  - Core workspace/project entities.
- `model/Issue.java`, `model/IssueComment.java`
  - Issue and comment entities.
- `model/Activity.java`
  - Activity feed entity.
- `model/AutomationRule.java`
  - Automation rule + nested trigger/condition/action value structure.
- `model/AppNotification.java`
  - Notification entity.

### DTOs (request/response contracts)

- `dto/ProjectDto.java`, `dto/UserDto.java`, `dto/ProjectUpdateRequest.java`
  - Project API contracts.
- `dto/IssueCreateRequest.java`, `dto/IssueStatusUpdateRequest.java`, `dto/AddCommentRequest.java`, `dto/RandomUpdateRequest.java`
  - Issue API contracts.
- `dto/ActivityFromIssueUpdateRequest.java`
  - Activity generation request contract.
- `dto/AutomationRuleCreateRequest.java`, `dto/AutomationRuleUpdateRequest.java`
  - Automation rule API contracts.
- `dto/AnalyticsDataDto.java`
  - Analytics response structure.
- `dto/AiMessageRequest.java`, `dto/AiMessageResponse.java`
  - AI endpoint contract.
- `dto/ErrorResponse.java`
  - Standardized error body.

### Resources + Build Files

- `src/main/resources/mock/mock-data.json`
  - Single source mock dataset for startup seed.
- `src/main/resources/application.properties`
  - Spring runtime properties.
- `pom.xml`
  - Maven dependencies/plugins/build setup.
- `mvnw`, `mvnw.cmd`, `.mvn/wrapper/*`
  - Maven wrapper scripts/config.

## Backend Folder Structure

```text
backend/jeerai-backend/
|-- .mvn/
|   `-- wrapper/
|       `-- maven-wrapper.properties
|-- src/
|   |-- main/
|   |   |-- java/com/jeerai/backend/
|   |   |   |-- JeeraiBackendApplication.java
|   |   |   |-- config/
|   |   |   |   |-- MockDataInitializer.java
|   |   |   |   |-- MockDataPayload.java
|   |   |   |   |-- SecurityConfig.java
|   |   |   |   `-- WebConfig.java
|   |   |   |-- controller/
|   |   |   |   |-- ActivityController.java
|   |   |   |   |-- AiController.java
|   |   |   |   |-- AnalyticsController.java
|   |   |   |   |-- AutomationRuleController.java
|   |   |   |   |-- GlobalExceptionHandler.java
|   |   |   |   |-- IssueController.java
|   |   |   |   |-- NotificationController.java
|   |   |   |   |-- ProjectController.java
|   |   |   |   |-- SprintController.java
|   |   |   |   `-- UserController.java
|   |   |   |-- dto/
|   |   |   |   |-- ActivityFromIssueUpdateRequest.java
|   |   |   |   |-- AddCommentRequest.java
|   |   |   |   |-- AiMessageRequest.java
|   |   |   |   |-- AiMessageResponse.java
|   |   |   |   |-- AnalyticsDataDto.java
|   |   |   |   |-- AutomationRuleCreateRequest.java
|   |   |   |   |-- AutomationRuleUpdateRequest.java
|   |   |   |   |-- ErrorResponse.java
|   |   |   |   |-- IssueCreateRequest.java
|   |   |   |   |-- IssueStatusUpdateRequest.java
|   |   |   |   |-- ProjectDto.java
|   |   |   |   |-- ProjectUpdateRequest.java
|   |   |   |   |-- RandomUpdateRequest.java
|   |   |   |   `-- UserDto.java
|   |   |   |-- model/
|   |   |   |   |-- Activity.java
|   |   |   |   |-- AppNotification.java
|   |   |   |   |-- AutomationRule.java
|   |   |   |   |-- Issue.java
|   |   |   |   |-- IssueComment.java
|   |   |   |   |-- Project.java
|   |   |   |   |-- Sprint.java
|   |   |   |   `-- User.java
|   |   |   |-- repository/
|   |   |   |   |-- InMemoryProjectRepository.java
|   |   |   |   |-- MockDataStore.java
|   |   |   |   `-- ProjectRepository.java
|   |   |   `-- service/
|   |   |       |-- ActivityService.java
|   |   |       |-- AiService.java
|   |   |       |-- AnalyticsService.java
|   |   |       |-- AutomationRuleService.java
|   |   |       |-- IssueService.java
|   |   |       |-- NotificationService.java
|   |   |       |-- ProjectService.java
|   |   |       |-- ResourceNotFoundException.java
|   |   |       |-- SprintService.java
|   |   |       `-- UserService.java
|   |   `-- resources/
|   |       |-- application.properties
|   |       `-- mock/
|   |           `-- mock-data.json
|   `-- test/
|       `-- java/com/jeerai/backend/
|           `-- JeeraiBackendApplicationTests.java
|-- .gitattributes
|-- .gitignore
|-- HELP.md
|-- mvnw
|-- mvnw.cmd
`-- pom.xml
```

## Notes

- Data is in-memory after startup (no persistent DB yet).
- To update default mock data, edit only `src/main/resources/mock/mock-data.json`.
- `target/` is build output and is intentionally not documented in detail.
