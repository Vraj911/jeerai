# Jeera2

Enterprise React frontend for Jira-like project execution workflows.

## Quick Start

```bash
npm install
npm run dev
```

Default app URL: `http://localhost:8080`

## Stack

- React + TypeScript (strict)
- Vite
- Tailwind + shadcn/ui
- TanStack Query for server-state style data flows
- Zustand for UI and interaction state

## Core Architecture

Data flow:

`UI -> Pages/Features -> Query hooks -> API contracts -> mockAdapter`

State split:

- Query: issues/projects/activities and mutations
- Zustand: sidebar, command palette state, UI preferences, notifications, interaction flags

## Implemented Enterprise Interaction Layer

### Board

- Board control bar with:
  - 200ms debounced board search (derived filtering only)
  - quick filters: My Issues, Recently Updated, High Priority
  - group-by selector UI (None, Assignee, Priority)
  - view settings toggles (compact cards, assignee, priority)
- Column header menu:
  - Collapse column (persisted via Zustand)
  - Move all issues (mock action)
  - Configure column (disabled)
- Collapsed columns show rotated status label
- Inline issue creation per column:
  - `+ Create` row
  - Enter submit, Escape cancel
  - optimistic cache insert via Query mutation
  - toast success feedback
- Drag-and-drop polish:
  - placeholder slot indicator
  - drag border emphasis
  - <=200ms transition-based drop feedback
  - optimistic status updates

### Issue Card

- Memoized enterprise-dense card
- Issue type icon (task/bug/story heuristic)
- Selection checkbox
- Priority indicator icon
- Hover actions menu (`...`)
- Right-click context menu:
  - Assign to me
  - Change status
  - Set priority
  - Copy issue link
- Assignee avatar with tooltip
- Search highlight support for title matches

### Command, Search, and Keyboard

- Full command palette (`Cmd/Ctrl + K`) powered by `command.store.ts`
  - fuzzy search
  - keyboard navigation
  - page navigation
  - issue search
  - project switching
  - create issue
  - open settings
- Global shortcut engine (disabled inside input/textarea/contenteditable):
  - `Cmd/Ctrl + K`
  - `G` then `P` (Projects)
  - `G` then `B` (Board)
  - `G` then `A` (Activity)
  - `C` (Create issue)
  - `/` (focus global search)
- Functional topbar global search dropdown (not modal):
  - 200ms debounce
  - grouped results: Issues, Projects, Members
  - arrow key navigation + Enter to route

### Realtime Simulation and Notifications

- Deterministic realtime engine in `useRealtimeSimulation`:
  - `setInterval` tick model
  - event timing every 20-40 seconds
  - mock data mutations through API/mock-backed arrays
- Random issue updates generate activity feed events
- Subtle activity pulse indicator
- Notification integration:
  - centralized notification store
  - unread badge updates in sidebar
  - click notification routes to target entity
  - mark all read action

### Project and UI Polish

- Compact project header context:
  - project avatar
  - member preview avatars
  - quick settings button
  - share button (mock)
- Professional neutral styling updates:
  - subtle interaction transitions (<=250ms)
  - hover brightness + border emphasis
  - click feedback
  - page enter transition (`opacity + translateY(8px -> 0)`)
  - muted grey project header treatment

### Loading, Accessibility, Performance

- Skeleton loaders:
  - board columns
  - issue list
  - activity feed
- Accessibility improvements:
  - keyboard-operable issue cards and menus
  - visible focus rings
  - ESC close behavior for overlays/search/command
  - ARIA roles on search combobox/listbox/options
- Performance:
  - memoized issue card
  - backlog virtualization (windowed rendering, no extra libs)
  - stable keys maintained
  - route-level `React.lazy` retained

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - lint
- `npm run test` - run tests

## Notes

- Frontend only; no backend attached yet.
- Replace API internals with real HTTP calls later while preserving UI/query contracts.
