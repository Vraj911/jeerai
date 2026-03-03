# Jeera2 Full-Stack (Frontend + Spring Boot Backend)

Jeera2 is now a full-stack app where all mock data is centralized in the backend and served through REST APIs.

## What Changed

Earlier, the frontend used `mockAdapter.ts` directly.

Now:

- `frontend/src/lib/mockAdapter.ts` is removed.
- A single backend JSON file is the source of truth for mock data:
  - `backend/jeerai-backend/src/main/resources/mock/mock-data.json`
- Spring Boot loads that JSON at startup via:
  - `MockDataInitializer`
  - `MockDataPayload`
- Data is stored in-memory in:
  - `MockDataStore`
- Frontend API modules call backend controllers through Axios `apiClient`.

## Data Flow (Current)

`UI -> Query Hooks -> frontend/src/api/*.ts -> HTTP /api/* -> Spring Controllers -> Services -> MockDataStore`

Startup seed flow:

`mock-data.json -> MockDataInitializer -> MockDataStore (+ ProjectRepository for projects)`

## Backend Mock Data Source

Single file:

- `backend/jeerai-backend/src/main/resources/mock/mock-data.json`

Contains:

- users
- projects
- sprints
- issues
- comments
- activities
- notifications
- automationRules

Loaded by:

- `backend/jeerai-backend/src/main/java/com/jeerai/backend/config/MockDataPayload.java`
- `backend/jeerai-backend/src/main/java/com/jeerai/backend/config/MockDataInitializer.java`

## API Contract Mapping

### Frontend API file -> Backend endpoint -> Controller

- `project.api.ts` -> `/api/projects` -> `ProjectController`
- `issue.api.ts` -> `/api/issues` -> `IssueController`
- `activity.api.ts` -> `/api/activities` -> `ActivityController`
- `automation.api.ts` -> `/api/automation-rules` -> `AutomationRuleController`
- `analytics.api.ts` -> `/api/analytics/projects/{projectId}` -> `AnalyticsController`
- `user.api.ts` -> `/api/users` -> `UserController`
- `sprint.api.ts` -> `/api/sprints` -> `SprintController`
- `notification.api.ts` -> `/api/notifications` -> `NotificationController`
- `ai.api.ts` -> `/api/ai/message` -> `AiController`

## How It Was Implemented

1. Removed frontend direct mock imports and deleted `mockAdapter.ts`.
2. Added backend domain models/services/controllers for missing entities (issues, activities, automation, analytics, users, sprints, notifications, ai).
3. Added `mock-data.json` as one centralized dataset.
4. Added JSON payload binder (`MockDataPayload`) and initializer loader (`MockDataInitializer`).
5. Rewired all frontend API modules to call backend endpoints.
6. Updated frontend pages/hooks/stores that previously depended on direct mock arrays.

## Run Locally

## 1) Backend (Spring Boot)

```bash
cd backend/jeerai-backend
mvn spring-boot:run
```

Default backend URL: `http://localhost:8080`

## 2) Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend URL (default Vite): `http://localhost:5173`

`frontend/src/app/config/env` should point API base URL to backend (`http://localhost:8080/api`).

## Verification Performed

- Backend compile:

```bash
cd backend/jeerai-backend
mvn -DskipTests compile
```

- Frontend build:

```bash
cd frontend
npm run build
```

Both pass after migration.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind, shadcn/ui, TanStack Query, Zustand
- Backend: Spring Boot 3, Java 17, in-memory repositories + JSON seed data

## Notes

- Data is in-memory after startup seed (not persisted DB yet).
- To modify default mock data, edit only:
  - `backend/jeerai-backend/src/main/resources/mock/mock-data.json`
