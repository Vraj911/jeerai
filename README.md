# Jeera2

**Enterprise project management application** — A frontend-only Jira-inspired system built with modern React, TypeScript, and enterprise-grade architecture.

---

## What is Jeera2?

Jeera2 is a **frontend-only** project management app modeled on Jira's information architecture. It provides:

- **Workspace** → **Projects** → **Boards/Backlog** → **Issues** hierarchy
- Kanban board with drag-and-drop
- Issue tracking, comments, activity feed
- AI-assisted productivity (suggestions only — user confirms)
- Analytics, automation rules (UI), notifications

**No backend yet.** All data comes from `lib/mockAdapter.ts`. Backend integration will replace this single file later.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080). You land on the Dashboard.

---

## Architecture at a Glance

```
UI Layer (presentational components)
    ↓
View Layer (pages, feature components)
    ↓
State Layer (TanStack Query + Zustand)
    ↓
API Contract Layer (src/api/*)
    ↓
Mock Adapter (lib/mockAdapter.ts)
```

### State Rules (Non-Negotiable)

| Data Type | Store | Purpose |
|-----------|-------|---------|
| Server data (issues, projects, etc.) | **TanStack Query** | Caching, fetching, mutations |
| UI state (sidebar, modals, theme) | **Zustand** | Local behavior, persisted where needed |

Never mix: server truth lives in Query; UI behavior in Zustand.

---

## Project Structure

```
src/
├── main.tsx              # React entry
├── App.tsx               # Providers (Theme, Query, Router)
├── app/                  # Bootstrap
│   ├── providers/        # QueryProvider, ThemeProvider, RouterProvider
│   └── config/           # queryClient, env
├── routes/               # AppRouter, routeConstants, ProtectedRoute
├── layouts/              # RootLayout, AuthLayout, AppLayout, ProjectLayout
├── pages/                # Route-level containers only (no business logic)
├── features/             # Domain modules (issues, projects, automation, etc.)
├── components/
│   ├── ui/               # Pure primitives (Button, Input, Card, etc.)
│   ├── layout/           # Sidebar, Topbar, CommandPalette, PageContainer
│   └── shared/           # Avatar, EmptyState, StatusIndicator
├── queries/              # TanStack Query hooks (useIssues, useProjects, etc.)
├── api/                  # HTTP contracts (issue.api, project.api, etc.)
├── store/                # Zustand (ui.store, theme.store, command.store)
├── hooks/                # useDebounce, useKeyboardShortcut, useMediaQuery
├── types/                # Data contracts (issue, project, user, etc.)
├── lib/
│   ├── mockAdapter.ts    # All mock data — single swap point for backend
│   ├── constants.ts
│   └── utils.ts
└── styles/               # globals.css, theme.css
```

---

## Key Concepts

### 1. Mock Data

All mock responses live in `lib/mockAdapter.ts`:

- `mockUsers`, `mockProjects`, `mockIssues`, `mockSprints`
- `mockComments`, `mockActivities`, `mockNotifications`
- `mockAutomationRules`

**No inline mock objects in components.** API layer consumes the adapter.

### 2. Routing

Routes are defined in `routes/routeConstants.ts`. Use `ROUTES.*` — no hardcoded paths.

| Area | Example |
|------|---------|
| Auth | `/auth/login`, `/auth/signup` |
| Workspace | `/app/dashboard`, `/app/projects`, `/app/members` |
| Project | `/app/projects/:projectId/board`, `.../backlog`, `.../analytics` |
| Issue | `/app/issues/:issueId` (full page, never modal) |

### 3. Layouts

- **RootLayout** — Theme, error boundary, global listeners
- **AppLayout** — Sidebar + Topbar shell (persistent)
- **ProjectLayout** — Project tabs (Overview, Board, Backlog, etc.)
- **AuthLayout** — Centered auth forms

### 4. Global Features

| Feature | Trigger | Purpose |
|---------|---------|---------|
| **Global Search** | `/` or click search | Search issues, projects, members (inline dropdown) |
| **Command Palette** | `Cmd+K` / `Ctrl+K` | Navigate, create issue, switch context |
| **Create Issue** | `C` or "+ Create" | Opens issue creation modal |
| **Theme Toggle** | Topbar icon | Light/dark (instant, no animation) |

### 5. Toast System

- **Library:** shadcn toast (Radix)
- **Position:** Bottom-right
- **Max visible:** 3
- **Auto-dismiss:** 3 seconds
- **Types:** success, error, info

---

## Tech Stack

| Category | Choice |
|----------|--------|
| Framework | React 18+ |
| Language | TypeScript (strict mode) |
| Bundler | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Server state | TanStack Query |
| UI state | Zustand |
| Charts | Recharts |
| Icons | lucide-react |
| Animations | Framer Motion (limited) |

---

## Design Philosophy

- **Industrial enterprise UI** — Dense, readable, Jira-like
- **Neutral palette** — White/grey hierarchy, muted blue accent
- **Borders over shadows** — Subtle separation
- **No gradients, glassmorphism, or neon**
- **Animations** — State change only, ≤250ms, no bounce/parallax

---

## For Developers

### Adding a New Page

1. Create page in `pages/` (e.g. `pages/workspace/NewPage.tsx`)
2. Add route in `routes/AppRouter.tsx` and `routeConstants.ts`
3. Add nav item in `Sidebar.tsx` if needed

### Adding a New API Endpoint

1. Add function in `api/*.api.ts`
2. Consume `mockAdapter` for data
3. Create TanStack Query hook in `queries/*.queries.ts`
4. Use the hook in pages/features — never call API directly from UI

### Backend Integration (Future)

Replace `lib/mockAdapter.ts` usage in `api/*` with real HTTP calls via `api/client.ts`. UI and state layer stay the same.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 8080) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest |

---

## License

Private — Enterprise use.
