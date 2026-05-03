# Notifications Audit and In-Memory Repositories Cleanup

Date: 2026-05-03

## Summary

- Completed a short audit of the notification subsystem (backend + frontend).
- Verified the in-memory/mock repository classes appear to be removed from source; README and build artifacts still reference them.
- This document lists findings, recommendations for the notifications feature, and a precise cleanup checklist for removing `InMemory*` / `MockDataStore` references safely.

---

## Notifications Audit (what I checked)

- Backend endpoints: `GET /api/notifications`, `PATCH /api/notifications/{id}/read`, `PATCH /api/notifications/read-all` implemented in:
  - `backend/jeerai-backend/src/main/java/com/jeerai/backend/controller/NotificationController.java`
  - `backend/jeerai-backend/src/main/java/com/jeerai/backend/service/NotificationService.java`
- Server-side scoping: authenticated user scoping is enforced via `CurrentUserProvider`.
- Persistence: JPA entity `NotificationEntity` and Flyway migration `V4__notification_recipient_user.sql` exist; `createdAt` uses `Instant`.
- Frontend: `notificationApi`, `useNotifications`, `useMarkNotificationRead`, `useMarkAllNotificationsRead`, `useNotificationStore` and `NotificationBootstrap`/`NotificationsPage` wired and functional. Token auth applied via `apiClient`.
- Realtime: only a development simulator (`useRealtimeSimulation`) exists. No production push channel (WebSocket/SSE) currently.

---

## Recommended improvements (actionable, prioritized)

1. Pagination for inbox: add `?page=` & `?size=` (or cursor-based) to `GET /api/notifications` and update React Query + store to fetch pages instead of entire inbox.
2. Add tests:
   - Backend: unit tests for `NotificationService` and controller integration tests (auth scoping + mark-read behavior).
   - Frontend: component tests for `NotificationsPage` and mutation flows (optimistic updates + query invalidation).
3. Real-time delivery (optional but recommended): implement server push via WebSocket or Server-Sent Events to deliver new notifications; fallback to polling.
4. Serialization/timezone checks: ensure `Instant` serializes to ISO-8601 and frontend handles parsing consistently; add an integration test.
5. Hardening: ensure `PATCH /read-all` is idempotent and documented; add rate-limiting or throttling if inbox is large.

---

## In-Memory Repositories Cleanup

Context: you removed the `InMemory*` repository classes (and `MockDataStore`) from `src/` because the mock/demo profile is no longer needed. Follow the checklist below to ensure no hidden references remain and remove any stale imports/config.

Checklist (do these steps locally or via PR):

1. Search the codebase for references to `InMemory` and `MockDataStore`:

   - Unix / Git Bash / PowerShell commands (run at repo root):

   ```bash
   # recursive, case-sensitive
   rg "InMemory|MockDataStore" || true
   # OR with grep
   grep -R --line-number "InMemory\|MockDataStore" . || true
   ```

   If no results appear in `src/main/java` or `src/test/java`, source-level references are gone.

2. Clean up leftover build artifacts / generated lists.

   - The `target/` folder may still reference the deleted files (from previous builds). Remove build artifacts and rebuild.

   ```bash
   cd backend/jeerai-backend
   ./mvnw clean
   ./mvnw -DskipTests package
   ```

   This will show compile errors if any code still imports the deleted classes.

3. Check DI / configuration profiles:

   - Inspect `src/main/resources/application*.yml` and Java `@Configuration` beans for any `@Profile("mock")` or explicit bean wiring that references in-memory adapters. Remove or update those sections.

4. Remove stale imports (if any compile errors show them):

   - If the build fails with `cannot find symbol: class InMemory...` or `MockDataStore`, open the failing files and either:
     - Replace the injection with the persisted JPA-backed adapter (e.g., `JpaNotificationRepositoryAdapter`), or
     - Remove the now-unused field/constructor parameter and update DI wiring accordingly.

   - Typical places to check:
     - `config` or `@Configuration` classes wiring repository beans
     - Any test helper classes that created demo data using `MockDataStore`

5. Update README and docs:

   - `backend/jeerai-backend/README.md` still lists `InMemory*` files and `MockDataStore`; update that README to indicate the mock profile was removed (or explain how to run a mock profile now if you keep it in another branch).

6. Run tests and manual smoke-check:

   ```bash
   # Backend
   cd backend/jeerai-backend
   ./mvnw test

   # Frontend (optional smoke)
   cd frontend
   npm install   # or bun install depending on project
   npm run build
   ```

7. Optional: Remove `mock` profile from build or keep as a documented legacy profile.

---

## If you want, I can (pick one or more):

- Run the repository-wide search and attempt to automatically remove imports/usages (I will create a small batch of code edits and run `mvnw -DskipTests package` to verify).  
- Implement backend pagination + frontend changes as a PR-sized change.  
- Scaffold basic unit tests for `NotificationService` and an integration test for the controller.

---

## Quick summary

- Notifications are implemented end-to-end and correctly scoped to the authenticated user.
- Removing `InMemory*` and `MockDataStore` is safe if there are no remaining imports; please run the `rg`/`grep` and a `mvnw clean package` to verify.  
- See checklist above for exact steps to finish cleanup and verification.

If you'd like, I can now run the code search and remove any leftover imports and then run a build to verify — tell me to proceed and I will create the changes and run the build.
