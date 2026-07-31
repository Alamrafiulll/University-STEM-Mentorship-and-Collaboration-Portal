# MMU STEM Mentorship and Collaboration Portal

An Angular web portal for Multimedia University students, mentors, and administrators to explore STEM mentors, collaborate on projects, manage requests, and use the built-in STEM Bot.

The repository currently contains a self-contained portfolio demo. It does **not** contain a server backend or database. The injectable `DemoBackend` service keeps sample data in memory, so changes reset whenever the browser performs a full reload.

## How the application works

- **Home** introduces the portal and links to the student experience.
- **STEM Portal** lets students browse mentors and projects and manage mentorship or project requests.
- **Mentor Portal** provides the existing mentor sign-in/registration forms, request decisions, and project creation.
- **Admin Portal** exposes the demo student and mentor approval lists.
- **STEM Bot** answers questions using the local demo response logic and can be moved around the viewport.
- Demo student, mentor, and admin sessions are preloaded so every workflow can be reviewed without external credentials.

No branding, visible copy, page layout, styling, asset, or user journey was intentionally redesigned during the Angular 22 update.

## Technology stack

- Angular 22.1 (standalone application)
- Angular Router
- Angular HttpClient provider
- TypeScript 6.0
- HTML5
- Plain CSS3
- RxJS 7.8
- Vitest with Happy DOM
- Node.js 22
- npm 10

No Angular Material, Bootstrap, Tailwind CSS, or other UI framework is used.

## Frontend architecture

The application boots from `src/main.ts` with the providers in `src/app/app.config.ts`. Angular Router owns the public URLs in `src/app/app.routes.ts`. The preserved UI shell is in separate TypeScript, HTML, and CSS files. `DemoBackend` contains the existing in-memory business behavior.

The detailed pre-migration inventory, route mapping, data dependencies, and preserved workflows are in [docs/MIGRATION_MAP.md](docs/MIGRATION_MAP.md).

```text
src/
├── app/
│   ├── app.ts
│   ├── app.html
│   ├── app.css
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── core/
│   │   └── api/
│   │       └── demo-backend.service.ts
│   └── route-stub.{ts,html,css}
├── assets/
├── environments/
│   ├── environment.ts
│   └── environment.production.ts
├── index.html
├── main.ts
└── styles.css
```

## Prerequisites

Install:

- Node.js 22.22.3 or newer, or Node.js 24.15.0 or newer
- npm 10.x

Confirm the installed versions:

```powershell
node --version
npm --version
```

## Install

From the directory containing `package.json`:

```powershell
npm install
```

## Run for development

```powershell
npm start
```

Open `http://localhost:4200/`. The Angular development server reloads the page when source files change.

To bind the server to another interface:

```powershell
npm start -- --host 0.0.0.0
```

## Production build

```powershell
npm run build
```

The browser bundle is written to `dist/frontend/browser/`.

To preview that production output locally, use any static server that falls back unknown routes to `index.html`.

## Tests

Run the complete test suite once:

```powershell
npm test -- --watch=false
```

Run in watch mode:

```powershell
npm test
```

The focused tests cover demo business rules and the public route map.

## Backend connection and environment configuration

There is no real backend in this repository. The current UI uses `src/app/core/api/demo-backend.service.ts` and does not send HTTP requests.

Angular `HttpClient` is registered in `app.config.ts` so a real backend can be connected without changing application bootstrap. Configure its base URL in:

- `src/environments/environment.ts` for development
- `src/environments/environment.production.ts` for production

Both currently use an empty `apiBaseUrl` because inventing an endpoint would misrepresent the application. When an actual backend is supplied, replace `DemoBackend` with typed Angular services that use this setting and retain the existing payloads and response behavior.

## Application routes

| Route | Purpose |
| --- | --- |
| `/home` | Landing page |
| `/stem-portal` | Mentors, projects, and student workspace |
| `/student-portal` | Legacy redirect to `/stem-portal` |
| `/mentor-portal` | Mentor access and workspace |
| `/chatbot` | Chatbot route entry; the bot is also globally available |
| `/admin-portal` | Demo administration dashboard |
| Any unknown route | Redirects to `/home` |

Vercel uses `vercel.json` to return `index.html` for client-side routes, which preserves direct refresh behavior.

## Interface screenshots

Reference screenshots are stored in `docs/screenshots/` at widths of 375 px, 768 px, and 1440 px for Home, STEM Portal, Mentor Portal, and Admin Portal.

| 375 px | 768 px | 1440 px |
| --- | --- | --- |
| ![Home at 375 pixels](docs/screenshots/home-375.png) | ![Home at 768 pixels](docs/screenshots/home-768.png) | ![Home at 1440 pixels](docs/screenshots/home-1440.png) |

The remaining route screenshots use the names `stem-portal-{width}.png`, `mentor-portal-{width}.png`, and `admin-portal-{width}.png` in the same directory.

## Assets and styling

Static files are served from `public/`, including the original MMU mascot and workspace imagery. The application uses the original Poppins font reference and the existing component stylesheet. Media queries, hover behavior, animations, colors, spacing, borders, and shadows were retained.

## Deployment

For Vercel, import this directory as the project root. `vercel.json` runs the production build, publishes `dist/frontend/browser`, and rewrites SPA routes to `index.html`.

## Current limitations

- Data is in memory and is not persisted.
- Authentication is intentionally disabled in the demo behavior already present in the repository.
- No server API, database, or backend tests can be documented or verified because those files are not included.
- The checked-in application began as a single large preserved UI shell; further feature-component extraction should be paired with visual regression tooling to avoid changing the legacy stylesheet’s selector behavior.
