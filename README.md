# TestPilot AI — Web

Web app for **TestPilot AI**, an AI-powered web application testing platform: write browser tests, run them in a real Chromium, and inspect the evidence when they fail.

> API: [test-pilot-be](https://github.com/revanhdp/test-pilot-be)

## Features

- **Landing page**: a split-flap "departure board" headline, then scenes that play when scrolled into view: one failing test played back from the agent to the bug report, a replay of the demo Bug Hunt run with its real failure messages, steps executing in sync with their JSON, a streamed failure analysis, a datasheet of what the engine does today, pricing (monthly/yearly) and an FAQ. Deep links such as `/#pricing` work on a fresh load.
- **Auth**: sign in, register, forgot and reset password.
- **Overview**: the latest or live run with its verdict and browser screenshot, test health across recent runs, recent failures.
- **Projects**: environments (target base URLs, plus optional sign-in steps performed once per run), test suites, recent runs.
- **Test cases**: list per suite, and a step editor for structured actions (navigate, click, fill, assertions…) with inline validation and `⌘S` to save. **Generate with AI** (new test case, or the button on the list) turns a goal into a draft: the goal, environment and starting page go to the API, and the steps come back into the editor as a **draft** (status Draft, with a notice) for you to review. Nothing is saved or run until you do it, and the browser still decides pass or fail. When the free AI quota (or the hourly cap) is used up, the dialog says so with a countdown and stays locked until the wait is over; it never retries or switches provider. A Navigate step fails on HTTP 4xx/5xx unless "Allow error status" is ticked. "Start signed in" begins a test with the session from its environment's sign-in steps; password fields stay masked.
- **Test runs**: run history and a live run view — the verdict, how the run's one sign-in went (when tests start signed in), per-test results, expected vs. actual, a step timeline with timestamps and the final screenshot in a browser frame.

AI Explorer, Bugs, Reports, Integrations and Settings are on the roadmap and not in the navigation yet.

## Stack

| | |
| --- | --- |
| Framework | Nuxt 4 (SPA mode), Vue 3, TypeScript |
| Styling | Tailwind CSS 4, IBM Plex Sans / IBM Plex Mono |
| Animation | Motion for Vue (`motion-v`), on the landing page only |
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
│   ├── test-case/  step editor, step row, locator input, AI generate dialog
│   ├── run/        status, result bar, browser frame, step timeline, result detail
│   └── landing/    landing scenes (split-flap, recorder, bug hunt, steps, analysis), run transcript (auth pages)
├── composables/    useAuth, useProjects, useStartRun, usePolling, useAi (AI status, generate, quota lock), usePlayback (landing scene clock)
├── middleware/     global auth guard
├── plugins/        $api fetch client (cookie session, 401 → sign-in)
├── types/          API response types
├── utils/          formatting, status metadata, step metadata, error helpers
└── assets/css/     Tailwind theme and design tokens
```

### API types

`app/types/api.ts` and `app/utils/steps.ts` mirror the API's response shapes and step contract (`src/test-steps/test-step.schema.ts` in the API repo). Update them together when the API changes.

## Design

An instrument panel for browser tests: warm graphite surfaces, paper-white text, hairline rules, IBM Plex Sans for the interface and IBM Plex Mono for data (keys, URLs, selectors, timings). A condensed cut of Plex Sans shows verdicts.

- **Color means outcome.** Green passed, red failed, amber error, blue running, gray skipped. Nothing else is colored: primary buttons are paper-white, priority is a level meter, links are underlined.
- **Results read like a test runner**: inverse `PASS` / `FAIL` tags, ✓ / ✕ marks, and step timestamps (`T+1.33`) in the run timeline.
- **The logo is a flight-test photo target**, the quadrant mark painted on test aircraft and crash-test dummies.
- **Motion explains, it doesn't decorate.** Landing scenes run on one clock each (`usePlayback`), play once when they scroll into view and can be replayed. The app itself only animates live state (a running run).
- Respects `prefers-reduced-motion`: scenes show their final state and the board stops flipping. Form fields use 16px text on phones so iOS doesn't zoom.

Tokens live in `app/assets/css/main.css` under `@theme`.

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
