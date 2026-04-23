# Jeerai Frontend

This frontend is a React + TypeScript + Vite application for the Jeerai workspace/project UI. If you want the frontend equivalent of the backend README, this file is the map: how the app starts, how routes are composed, how auth/session state works, how data reaches the backend, which stores own what, and which files are responsible for each screen.

This is not a literal line-by-line annotation of every source file. That would be too large to maintain and would stop being useful quickly. Instead, this README explains the codebase in the same detailed, file-oriented style as the backend README, with enough structure that you can open any file and already know why it exists.

## What This Project Is

The frontend provides:

- auth screens for login/signup/forgot password
- onboarding and invitation acceptance
- workspace dashboard, members, workspace settings
- project listing and project creation
- project views for overview, board, backlog, issues, analytics, automation, settings
- issue detail UI
- notifications, activity feed, AI workspace
- global search, command palette, theme toggle, account menu

The frontend is a client-rendered SPA. Routing is handled in the browser. Session state is persisted in Zustand. Server state is fetched through Axios and TanStack Query.

## Node Developer Mental Model

If you come from a Node/React app, use this mapping:

- `src/main.tsx`
  - like the frontend bootstrap entry, equivalent to mounting React in `index.tsx`
- `src/App.tsx`
  - root app composition layer
- `src/app/providers`
  - app-wide providers like Query Client, Router, theme wiring
- `src/routes`
  - route table and protected-route logic
- `src/layouts`
  - app shells that wrap pages
- `src/pages`
  - route-level screens
- `src/api`
  - raw HTTP functions
- `src/queries`
  - TanStack Query hooks and mutations
- `src/store`
  - Zustand client state stores
- `src/features`
  - feature-scoped components like modals/cards/forms
- `src/components`
  - reusable layout/shared/UI components
- `src/types`
  - app-level TypeScript contracts
- `src/lib`
  - constants, helpers, utilities

## Runtime Stack

Main frontend runtime libraries:

- React 18
- React Router DOM
- TanStack Query
- Axios
- Zustand
- Vite
- Tailwind CSS
- Radix UI / shadcn-style component primitives
- Recharts
- date-fns

Important split:

- server state:
  - handled with TanStack Query and Axios
- client UI/session state:
  - handled with Zustand
- route state:
  - handled by React Router

## Current Configuration

Environment config is centralized in [src/app/config/env.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/app/config/env.ts).

Current behavior:

```ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
```

Meaning:

- `VITE_API_BASE_URL`
  - backend base URL used by Axios
- if missing, frontend falls back to `/api`
- in local development for this repo, `.env` points to `http://localhost:3000/api`

The actual local env file typically used here is:

- `frontend/.env`

Example:

```properties
VITE_API_BASE_URL=http://localhost:3000/api
```

## How Startup Works

When you run:

```powershell
npm run dev
```

the normal startup order is:

1. Vite serves `index.html`.
2. `src/main.tsx` mounts React into `#root`.
3. `src/App.tsx` composes providers and bootstraps system helpers.
4. `ThemeProvider` applies the current theme class to `<html>`.
5. `QueryProvider` installs the TanStack Query client.
6. `TooltipProvider`, `Toaster`, and `NotificationBootstrap` are mounted.
7. `RouterProvider` starts `BrowserRouter`.
8. `AppRouter` resolves the current route and lazy-loads the target page/layout tree.

## App Composition

### Entry point

- [src/main.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/main.tsx)
  - imports global CSS
  - mounts `<App />`

### Root app

- [src/App.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/App.tsx)
  - wraps the app in:
    - `ThemeProvider`
    - `QueryProvider`
    - `TooltipProvider`
    - `NotificationBootstrap`
    - `Toaster`
    - `RouterProvider`

### Providers

- [src/app/providers/ThemeProvider.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/app/providers/ThemeProvider.tsx)
  - reads theme from Zustand
  - toggles `light` / `dark` class on `document.documentElement`

- [src/app/providers/QueryProvider.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/app/providers/QueryProvider.tsx)
  - installs the shared Query Client

- [src/app/providers/RouterProvider.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/app/providers/RouterProvider.tsx)
  - mounts `BrowserRouter`
  - renders `AppRouter`

### Query client config

- `src/app/config/queryClient`
  - shared TanStack Query client instance
- [src/app/config/env.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/app/config/env.ts)
  - environment helper

## Routing

Routing is defined in [src/routes/AppRouter.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/routes/AppRouter.tsx).

Main route buckets:

- `/auth/*`
  - login, signup, forgot-password
- `/onboarding`
  - workspace creation/join flow for users without a workspace
- `/invite/:token`
  - invitation review and acceptance
- `/app/*`
  - protected application shell

Protected shell:

- `ProtectedRoute`
  - blocks app routes until session hydration is complete
  - redirects unauthenticated users to login

Route layouts:

- `RootLayout`
  - outermost layout wrapper
- `AuthLayout`
  - auth-only shell
- `AppLayout`
  - sidebar + topbar + workspace-level shell
- `ProjectLayout`
  - project header + project tab nav

### Route constants

- [src/routes/routeConstants.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/routes/routeConstants.ts)
  - centralized route builder object
  - used by pages, topbar search, project cards, issue links

### Protected route behavior

- [src/routes/ProtectedRoute.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/routes/ProtectedRoute.tsx)
  - waits for `session.hasHydrated`
  - if no `currentUser` after hydration, redirects to login
  - otherwise renders the nested protected route tree

## Layout System

### RootLayout

- [src/layouts/RootLayout.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/layouts/RootLayout.tsx)
  - top-level route outlet wrapper

### AuthLayout

- [src/layouts/AuthLayout.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/layouts/AuthLayout.tsx)
  - visual shell for login/signup/forgot password

### AppLayout

- [src/layouts/AppLayout.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/layouts/AppLayout.tsx)
  - main authenticated shell
  - mounts:
    - `Sidebar`
    - `Topbar`
    - `CommandPalette`
    - `IssueCreateModal`
  - bootstraps current workspace selection
  - derives `currentRole` from workspace member data
  - runs the realtime simulation hook only when session context is valid

### ProjectLayout

- [src/layouts/ProjectLayout.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/layouts/ProjectLayout.tsx)
  - loads current project
  - renders project avatar/title/member strip
  - exposes project-level actions:
    - settings
    - share
  - renders project tab navigation:
    - overview
    - board
    - backlog
    - issues
    - analytics
    - automation

## State Management

The frontend uses Zustand for client state.

### Session store

- [src/store/session.store.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/store/session.store.ts)
  - persisted store
  - owns:
    - `hasHydrated`
    - `currentUser`
    - `currentWorkspace`
    - `currentRole`
    - `token`
  - this is the source of truth for auth/session state in the UI

### Notification store

- [src/store/notification.store.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/store/notification.store.ts)
  - owns notification list currently rendered in the UI
  - supports:
    - replace all notifications
    - mark one read
    - mark all read
    - push new realtime notification

### UI store

- [src/store/ui.store.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/store/ui.store.ts)
  - owns transient UI flags
  - examples:
    - sidebar collapsed
    - collapsed board columns
    - issue/project create modal state
    - global search open
    - activity pulse

### Theme store

- `src/store/theme.store.ts`
  - light/dark theme state

### Command store

- `src/store/command.store.ts`
  - command palette open state

## Server State Flow

Raw HTTP layer:

- `src/api/*.ts`

Query/mutation layer:

- `src/queries/*.ts`

Render layer:

- pages, layouts, feature components

Actual flow:

`Page/Component -> Query Hook -> API module -> Axios client -> backend endpoint -> response -> Query cache -> UI`

## HTTP Layer

### Shared Axios client

- [src/api/client.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/api/client.ts)
  - creates the shared Axios instance
  - uses `env.apiBaseUrl`
  - attaches `Authorization: Bearer <token>` from session store through request interceptor

### API modules

Each file in `src/api` is a thin wrapper over backend endpoints:

- `auth.api.ts`
  - login/signup
- `workspace.api.ts`
  - workspace list/create/members/dashboard-access/onboarding
- `invitation.api.ts`
  - invitation read/create/accept/list
- `project.api.ts`
  - project list/create/read/update
- `issue.api.ts`
  - issue list/detail/create/update/status/comments/random simulation
- `activity.api.ts`
  - activity read/create/from-issue-update
- `analytics.api.ts`
  - project analytics
- `automation.api.ts`
  - automation rules CRUD-like actions
- `notification.api.ts`
  - notification list + mark-read + mark-all-read
- `sprint.api.ts`
  - sprint list
- `user.api.ts`
  - user list
- `ai.api.ts`
  - AI workspace message endpoint

## Query Hooks

TanStack Query hooks live in `src/queries`.

Patterns used:

- `useQuery`
  - for reads
- `useMutation`
  - for creates/updates
- query invalidation after mutations
- route/page components consume query hooks, not raw API modules directly in most cases

Examples:

- `workspace.queries.ts`
  - current user workspaces, members, dashboard access, onboarding status
- `project.queries.ts`
  - projects list/detail/create/update
- `issue.queries.ts`
  - issue list/detail/comments/create/update/status
- `notification.queries.ts`
  - notifications read + mark-read mutations

## Notification Bootstrap

- [src/components/system/NotificationBootstrap.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/components/system/NotificationBootstrap.tsx)
  - reads notifications through TanStack Query
  - pushes them into the notification store
  - this is why notifications populate globally, not only inside the notifications page

## Auth Flow

### Signup

Frontend flow:

1. `SignupPage` collects:
   - workspace name
   - user name
   - email
   - password
2. `authApi.signup()` creates the user and returns JWT + user
3. session store saves token + user
4. `workspaceApi.create()` creates the first workspace
5. session store saves that workspace
6. route changes to dashboard

Relevant files:

- [src/pages/auth/SignupPage.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/pages/auth/SignupPage.tsx)
- [src/api/auth.api.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/api/auth.api.ts)
- [src/queries/workspace.queries.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/queries/workspace.queries.ts)
- [src/store/session.store.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/store/session.store.ts)

### Login

Frontend flow:

1. `LoginPage` collects email/password
2. `authApi.login()` returns JWT + user
3. token and user are stored in session store
4. frontend loads workspaces for that user
5. if no workspace exists:
   - user is sent to onboarding
6. if workspaces exist:
   - first workspace is selected
   - `currentRole` is later derived in `AppLayout`

Relevant files:

- [src/pages/auth/LoginPage.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/pages/auth/LoginPage.tsx)
- [src/api/auth.api.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/api/auth.api.ts)
- [src/store/session.store.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/store/session.store.ts)

### Auth API detail

- auth routes are not under `/api`
- `auth.api.ts` derives `authBaseUrl` by stripping `/api` from the configured API base URL

That is why login/signup call:

- `/auth/login`
- `/auth/signup`

instead of:

- `/api/auth/login`
- `/api/auth/signup`

## Workspace and Role Flow

The app is workspace-centered.

Session knows:

- who the user is
- which workspace is currently selected
- which workspace role the user currently has

Important detail:

- `currentWorkspace` comes from workspace selection/bootstrap
- `currentRole` is not trusted from a hardcoded UI assumption
- `AppLayout` derives it from workspace members data

This is why `useWorkspaceMembers(currentWorkspace?.id)` is important in the shell.

## Major Screens

### Auth pages

- `pages/auth/LoginPage.tsx`
  - sign-in form
  - visible link to signup
  - redirect to onboarding if user has zero workspaces

- `pages/auth/SignupPage.tsx`
  - account creation + first workspace creation

- `pages/auth/ForgotPassword.tsx`
  - placeholder/utility auth screen

### Workspace pages

- `pages/workspace/OnboardingPage.tsx`
  - shown when a logged-in user has no workspace
  - create workspace or paste invitation token

- `pages/workspace/InvitationPage.tsx`
  - validates and accepts invite token

- `pages/workspace/DashboardPage.tsx`
  - workspace-level landing page

- `pages/workspace/ProjectsPage.tsx`
  - project list
  - project creation entry point

- `pages/workspace/MembersPage.tsx`
  - workspace members list
  - invitation form for OWNER/ADMIN

- `pages/workspace/WorkspaceSettings.tsx`
  - current workspace name/slug view

### Project pages

- `pages/project/OverviewPage.tsx`
  - project overview summary

- `pages/project/BoardPage.tsx`
  - kanban board
  - drag/drop status updates
  - per-column create issue modal
  - board filters and display settings

- `pages/project/BacklogPage.tsx`
  - split view for backlog and done issues

- `pages/project/IssuesListPage.tsx`
  - issues table/list page

- `pages/project/AnalyticsPage.tsx`
  - charts powered by backend analytics

- `pages/project/AutomationPage.tsx`
  - automation rules UI

- `pages/project/ProjectSettings.tsx`
  - project general/settings tabs
  - currently shows workspace roles for project members, not a true project-role system

- `pages/project/components/BoardControlBar.tsx`
  - board search/filters/view controls

### Issue page

- `pages/issue/IssueDetailPage.tsx`
  - single issue detail view

### System pages

- `pages/system/NotificationsPage.tsx`
  - notifications list
  - backend-persisted mark-read / mark-all-read actions

- `pages/system/ActivityPage.tsx`
  - activity feed

- `pages/system/AIWorkspacePage.tsx`
  - frontend shell for AI interactions

### Utility pages

- `pages/NotFound.tsx`
  - catch-all route screen

- `pages/ErrorBoundary.tsx`
  - error UI helper

## Feature Components

Feature-specific components live under `src/features`.

Examples:

- `features/issues/components/IssueCreateModal.tsx`
  - reusable create-issue modal
  - supports fixed project/status for board-column creation

- `features/issues/components/IssueCard.tsx`
  - board card rendering

- `features/projects/components/ProjectCreateModal.tsx`
  - project creation modal

- `features/projects/components/ProjectCard.tsx`
  - project list card

## Shared Components

### Layout components

- `components/layout/Sidebar.tsx`
  - primary nav
  - workspace name display
  - unread notification badge

- `components/layout/Topbar.tsx`
  - global search
  - command palette trigger
  - theme toggle
  - account dropdown

- `components/layout/CommandPalette.tsx`
  - keyboard-driven app navigation/actions

- `components/layout/PageContainer.tsx`
  - consistent page spacing/title/actions wrapper

### System helpers

- `components/system/NotificationBootstrap.tsx`
  - notification hydration bridge

### UI primitives

- `components/ui/*`
  - button, input, dialog, dropdown-menu, tabs, table, toast, avatar, etc.
  - mostly design-system primitives and wrappers

## Hooks

Hooks in `src/hooks` are mostly cross-cutting UI logic.

Important examples:

- `useRealtimeSimulation.ts`
  - periodic backend-driven issue update simulation
  - guarded to avoid retry loops and no-session execution

- `useDebounce.ts`
  - reused in board/global search UX

- `use-toast.ts`
  - toast helper

## Types

Types in `src/types` are the app contracts used across UI, API modules, queries, and stores.

Main files:

- `issue.ts`
- `project.ts`
- `workspace.ts`
- `notification.ts`
- `activity.ts`
- `user.ts`
- `automation.ts`
- `ai.ts`

These files are the first place to inspect when you need the shape of UI state or backend payloads.

## Utility / Library Layer

`src/lib` contains helpers and constants.

Important examples:

- `constants`
  - UI labels like status labels, app name, sidebar widths
- `utils`
  - className merge helpers and common small utilities
- `search`
  - fuzzy matching for global search

## Notification Read-State Fix

One important recent frontend behavior change:

- notification read state is no longer local-only
- the frontend now calls backend mutations to persist read status
- refresh no longer resets all notifications to unread

Relevant files:

- [src/api/notification.api.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/api/notification.api.ts)
- [src/queries/notification.queries.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/queries/notification.queries.ts)
- [src/pages/system/NotificationsPage.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/pages/system/NotificationsPage.tsx)

## Project and Issue Creation Flow

### Project creation

1. user opens `ProjectCreateModal`
2. modal calls `useCreateProject()`
3. mutation calls `projectApi.create()`
4. backend persists the project
5. query cache invalidates `projects`
6. project appears in Projects page

### Issue creation

Two entry points exist:

- global/shared modal from app shell
- board-column create buttons with fixed status/project

In both cases:

1. `IssueCreateModal` collects data
2. `useCreateIssue()` mutation runs
3. query invalidates `issues`
4. updated board/list pages re-render from server state

## Realtime Simulation

`useRealtimeSimulation.ts` is mounted in `AppLayout`.

Behavior:

- only runs when token + user + workspace exist
- prevents overlapping requests
- stops retry storms on hard failures
- disables itself when no simulation target exists

This hook is intentionally defensive because earlier behavior caused repeated failing requests.

## How To Read The Code Fast

If you want the fastest path through the frontend, read in this order:

1. [src/main.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/main.tsx)
2. [src/App.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/App.tsx)
3. [src/routes/AppRouter.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/routes/AppRouter.tsx)
4. [src/routes/ProtectedRoute.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/routes/ProtectedRoute.tsx)
5. [src/store/session.store.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/store/session.store.ts)
6. [src/layouts/AppLayout.tsx](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/layouts/AppLayout.tsx)
7. [src/api/client.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/api/client.ts)
8. one API + query pair, for example:
   - [src/api/project.api.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/api/project.api.ts)
   - [src/queries/project.queries.ts](C:/Users/VRAJ%20SHAH/Desktop/jeera/frontend/src/queries/project.queries.ts)
9. one workspace page, one project page, one system page
10. `Topbar`, `Sidebar`, and key modals/components

## File Ownership Map

If you need to know "where should I change this?", use this guide:

- auth/session bug
  - `pages/auth/*`, `session.store.ts`, `ProtectedRoute.tsx`, `AppLayout.tsx`
- workspace bootstrapping / onboarding
  - `workspace.api.ts`, `workspace.queries.ts`, `OnboardingPage.tsx`, `InvitationPage.tsx`
- top navigation / account menu / global search
  - `Topbar.tsx`, `CommandPalette.tsx`, `routeConstants.ts`
- sidebar / unread badge / nav visibility
  - `Sidebar.tsx`, `notification.store.ts`, `session.store.ts`
- project list / project creation
  - `ProjectsPage.tsx`, `ProjectCreateModal.tsx`, `project.api.ts`, `project.queries.ts`
- board behavior
  - `BoardPage.tsx`, `BoardControlBar.tsx`, `IssueCard.tsx`, `IssueCreateModal.tsx`
- backlog view
  - `BacklogPage.tsx`
- notifications persistence
  - `notification.api.ts`, `notification.queries.ts`, `NotificationsPage.tsx`, `NotificationBootstrap.tsx`
- workspace/project settings display
  - `WorkspaceSettings.tsx`, `ProjectSettings.tsx`

## Build And Run

From the frontend folder:

```powershell
npm install
npm run dev
```

Build:

```powershell
npm run build
```

Tests:

```powershell
npm run test
```

Lint:

```powershell
npm run lint
```

Default local frontend URL:

- `http://localhost:5173`

Expected backend URL in this repo:

- `http://localhost:3000/api`

## Known Notes

- this app uses persisted Zustand session state, so hydration timing matters
- role-aware UI often depends on workspace members data resolving after app-shell mount
- notifications are hydrated both into Query cache and Zustand store
- some settings pages are still display-oriented rather than full CRUD
- the shared UI primitives under `components/ui` are numerous but mostly low-level wrappers, not business logic files

## Short Conclusion

This frontend is not just a collection of pages. It has a clear layered structure:

- providers bootstrap the app
- routes define shells and protected sections
- layouts coordinate workspace/project context
- API modules define backend contracts
- query hooks own server-state lifecycle
- Zustand stores own client state
- pages compose feature behavior

If you understand:

- `App.tsx`
- `AppRouter.tsx`
- `session.store.ts`
- `api/client.ts`
- one query/api pair
- `AppLayout.tsx`
- `ProjectLayout.tsx`

you can navigate the rest of the frontend codebase quickly and safely.
