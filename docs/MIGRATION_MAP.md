# Frontend audit and migration map

This document records the repository state inspected before the Angular 22 update.

## Repository boundary

- Frontend: `src/`, `public/`, Angular workspace configuration, package files, and Vercel SPA configuration.
- Backend: no server application, database configuration, schema, controllers, or remote API client exists in this repository.
- Runtime data layer: `src/app/core/api/demo-backend.service.ts` is an injectable in-memory TypeScript demo service used by the UI. State resets on a full page reload.
- Legacy frontend: none was present. The checked-in baseline was already an Angular 21 standalone application.

## Page and route map

| Existing view | Angular route | Rendering component | Data/service dependency | Existing endpoint | Preserved styles/assets |
| --- | --- | --- | --- | --- | --- |
| Home | `/home` | `App` shell selected through `RouteStub` | `DemoBackend.catalog()` and chatbot state | None | `app.css`, `ebee-home.png`, `mmu-ebee.png`, `stem-workspace.jpg` |
| STEM portal: mentors | `/stem-portal` | `App` shell, mentors tab | Catalog and student session methods in `DemoBackend` | None | `app.css`, existing card and tab classes |
| STEM portal: projects | `/stem-portal` | `App` shell, projects tab | Catalog and project request methods in `DemoBackend` | None | `app.css`, existing project cards |
| STEM portal: workspace | `/stem-portal` | `App` shell, workspace tab | Student session/request methods in `DemoBackend` | None | `app.css`, existing forms and status cards |
| Legacy student entry | `/student-portal` | Redirect to STEM portal | Angular Router redirect | None | No independent view |
| Mentor portal | `/mentor-portal` | `App` shell selected through `RouteStub` | Mentor registration, session, request, and project methods in `DemoBackend` | None | `app.css`, existing auth/workspace forms |
| Chatbot entry | `/chatbot` | `App` shell selected through `RouteStub` | `DemoBackend.chatReply()` | None | Floating chatbot CSS and MMU mascot assets |
| Admin portal | `/admin-portal` | `App` shell selected through `RouteStub` | Admin list and mutation methods in `DemoBackend` | None | Existing admin tabs, cards, and tables |
| Unknown URL | `**` | Redirect to `/home` | Angular Router | None | No independent view |

## Preserved workflows

1. Browse mentors and projects without authentication.
2. Use the preloaded demo student or submit the existing student login/registration forms.
3. Connect to a mentor, request a project seat, and withdraw requests.
4. Use the mentor workspace to accept/reject requests and create projects.
5. Submit mentor registration for admin approval.
6. Approve, reject, or remove demo records in the admin portal.
7. Open, drag, close, and use the floating STEM Bot.
8. Navigate through Angular routes, browser history, and direct SPA refreshes.

## Compatibility notes

- No backend compatibility changes were made because no backend is included.
- `HttpClient` is provided at application bootstrap and `environment.apiBaseUrl` is the single integration point for a future real API.
- The large checked-in stylesheet and DOM structure remain in place to avoid visual changes during the framework upgrade.
