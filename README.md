# TestPilot AI — Web

Web app for **TestPilot AI**, an AI-powered web application testing platform: a dark, developer-focused "testing control room" for writing browser tests, running them in a real Chromium, and inspecting the evidence when they fail.

> API: [test-pilot-be](https://github.com/revanhdp/test-pilot-be)

## Features

- **Landing page**: product overview with a live-looking composite of agent activity, browser, failed assertion and bug report.
- **Auth**: sign in, register, forgot and reset password.
- **Overview**: the latest or live run with its browser screenshot, test health across recent runs, recent failures.
- **Projects**: environments (target base URLs), test suites, recent runs.
- **Test cases**: list per suite, and a step editor for structured actions (navigate, click, fill, assertions…) with inline validation and `⌘S` to save. A Navigate step fails on HTTP 4xx/5xx unless "Allow error status" is ticked.
- **Test runs**: run history and a live run view — per-test results, expected vs. actual, a step-by-step timeline and the final screenshot in a browser frame.

AI Explorer, Bugs, Reports, Integrations and Settings appear in the sidebar as upcoming.

## Stack

| | |
| --- | --- |
| Framework | Nuxt 4 (SPA mode), Vue 3, TypeScript |
| Styling | Tailwind CSS 4, Geist / Geist Mono fonts |
| Icons | Lucide |
| Tooling | pnpm, vue-tsc |

## Getting started

Requirements: Node 22+, pnpm 11, and the [API](https://github.com/revanhdp/test-pilot-be) running on `http://localhost:4001`.

```bash
pnpm install
pnpm dev          # http://localhost:4000
```

During development Nuxt proxies `/api` to the API, so the session cookie stays first-party (the same shape as Nginx in production). If the API runs elsewhere:

```bash
API_PROXY_TARGET=http://localhost:5001 pnpm dev
```

With the API's demo data seeded, sign in as **demo@testpilot.dev / testpilot**.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server on port 4000 |
| `pnpm build` | Static build (`nuxt generate`) into `.output/public` |
| `pnpm preview` | Preview the build |
| `pnpm typecheck` | Type-check with vue-tsc |

## Project structure

```
app/
├── pages/          routes: landing, auth, dashboard, projects, test-cases, test-runs
├── layouts/        default (app shell with sidebar), auth
├── components/
│   ├── ui/         design-system primitives (Button, Input, Select, Modal, Badge…)
│   ├── app/        shell: sidebar, project switcher, page header, logo
│   ├── project/    project, environment and suite modals
│   ├── test-case/  step editor, step row, locator input
│   ├── run/        status, result bar, browser frame, step timeline, result detail
│   └── landing/    hero visual
├── composables/    useAuth, useProjects, useStartRun, usePolling
├── middleware/     global auth guard
├── plugins/        $api fetch client (cookie session, 401 → sign-in)
├── types/          API response types
├── utils/          formatting, status metadata, step metadata, error helpers
└── assets/css/     Tailwind theme and design tokens
```

### API types

`app/types/api.ts` and `app/utils/steps.ts` mirror the API's response shapes and step contract (`src/test-steps/test-step.schema.ts` in the API repo). Update them together when the API changes.

## Design

"AI testing control room": dark charcoal surfaces with hairline borders, one violet/blue accent for AI and focus, and semantic colors reserved for test outcomes (pass, fail, skipped, running). Tokens live in `app/assets/css/main.css` under `@theme`.

## Deployment

The app is an SPA, so `pnpm build` produces static files and no Node process is needed in production. Serve `.output/public` with Nginx and proxy `/api` to the API:

```nginx
server {
  server_name testpilot.example.com;
  root /srv/test-pilot-fe/.output/public;

  location /api/ {
    proxy_pass http://127.0.0.1:4001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /200.html;
  }
}
```
