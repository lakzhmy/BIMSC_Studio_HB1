# BIMSC Studio HB1 — Lung Tower

A Vue 3 single-page application for architectural BIM project management, designed for the **Lung Tower** studio project at MACAD. The app supports three studio teams (Structure, Program, Data) with Google OAuth authentication, KPI tracking from live Google Sheets data, a Speckle-powered 3D BIM viewer, and an animated blob avatar identity system.

### Live App

**[https://bimscstudiohb1-production.up.railway.app](https://bimscstudiohb1-production.up.railway.app)**

Deployed on [Railway](https://railway.app), connected to this GitHub repo. Every push to the connected branch triggers an automatic redeploy (build → serve).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Setup & Running](#setup--running)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Views & Routing](#views--routing)
- [Components](#components)
- [State Management (Pinia)](#state-management-pinia)
- [External Integrations](#external-integrations)
- [Design System](#design-system)
- [Data & Sample Data](#data--sample-data)
- [Backend Server](#backend-server)

---

## Project Overview

Lung Tower Studio is a project management and collaboration platform for three teams working on a 200-floor high-rise BIM project. Key capabilities:

- **Google OAuth login** with persistent team and avatar profile (stored in PostgreSQL and localStorage)
- **Avatar Lab** — each user configures an animated blob avatar with sliders for speed, wobble, complexity, and shade
- **Dashboard** — overview of project health, all team members, recent activity, and milestone tracking
- **KPI Dashboard** — live data from Google Sheets; separate tabs for Program, Structure, Data, and Vitals
- **Timeline** — 10-week polyline timeline with per-team deliverable cards and a "We are here" marker
- **3D Viewer** — week-by-week Speckle BIM model viewer with a timeline slider (weeks 1-5 have live models)
- **Teams** — team cards, member management (add/remove), meetings, actions, and hour tracking

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Vue 3 (Composition API, `<script setup>`) |
| Routing | Vue Router 4 with navigation guards |
| State management | Pinia (persisted to `localStorage`) |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 with custom design tokens |
| Icons | Lucide Vue Next |
| 3D viewer | @speckle/viewer 2.28 (Three.js peer dependency) |
| Backend | Express.js (Node) |
| Database | PostgreSQL |
| Auth | Google OAuth 2.0 |
| KPI data | Google Sheets (published CSV, no API key needed) |

> **Note:** The repository also contains legacy React files (`src/main.tsx`, `src/App.tsx`, `src/pages/`) from an earlier prototype. These are not used in the active build. Only the Vue build (`vite.config.js` + `src/main.js`) runs the app.

---

## Architecture Overview

```
Browser
  │
  ├── Vue SPA (Vite dev server, port 5173)
  │     ├── Vue Router → views (Dashboard, KPI, Timeline, Viewer, Teams)
  │     ├── Pinia userStore ← localStorage['bimsc_studio_data']
  │     ├── Google Sheets CSV (published, no auth) → KPI Dashboard
  │     └── Speckle models via reverse proxy (/streams, /objects → app.speckle.systems)
  │
  └── Express server (port 5174)
        ├── GET  /auth/google         → redirect to Google OAuth
        ├── GET  /auth/callback       → exchange code, fetch profile, upsert PostgreSQL
        ├── POST /api/users/profile   → save team + avatar config to PostgreSQL
        └── Speckle proxy             → injects Bearer token, forwards to app.speckle.systems

PostgreSQL
  └── users table (googleId, name, email, team, avatar config, timestamps)
```

**Auth flow:**
1. User clicks "Sign in with Google" → hits `/auth/google` on the Express server
2. Google redirects back to `/auth/callback` → server exchanges code, fetches profile, upserts user in DB
3. Server redirects to `/auth/success?email=...&name=...&team=...`
4. `AuthCallback.vue` reads query params → calls `userStore.login()` → routes to `/dashboard` (returning user) or `/profile` (new user)

---

## Setup & Running

The app is already live at **[https://bimscstudiohb1-production.up.railway.app](https://bimscstudiohb1-production.up.railway.app)** — you don't need to run anything locally to use it. Local setup is only needed if you want to develop or test changes before pushing.

### How deployment works

Railway is connected to this GitHub repo via the Railway dashboard (nothing in the code itself links to it). On every push to the connected branch, Railway automatically:
1. Runs `npm install`
2. Runs `npm run build` — compiles the Vue app into `dist/`
3. Runs `npm run start` — starts `server/index.js`, which serves `dist/` as static files and handles all API routes and proxies

No separate static hosting is needed — the Express server serves both the frontend and the backend.

### Prerequisites (local dev only)

- Node.js 18+
- npm 9+
- PostgreSQL database (for user persistence)

### Install dependencies

```bash
npm install
```

### Running in development

You need two processes running simultaneously:

**Terminal 1 — Backend (auth + Speckle proxy):**
```bash
npm run dev:server
```
Starts the Express server on `http://localhost:5174`.

**Terminal 2 — Frontend (Vue SPA):**
```bash
npm run dev
```
Starts the Vite dev server on `http://localhost:5173`.

Open `http://localhost:5173` in your browser.

### Production build

```bash
npm run build   # outputs to dist/
npm run start   # serves dist/ and runs the Express proxy
```

### Preview production build locally

```bash
npm run preview
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# Speckle — personal access token for private stream access
VITE_SPECKLE_TOKEN=your_speckle_token_here

# Speckle server (default: https://app.speckle.systems)
SPECKLE_SERVER_URL=https://app.speckle.systems

# Express server port
PORT=5174

# Google OAuth credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

> The Speckle token is injected server-side by the Vite proxy and Express server so it is never exposed to the browser.

---

## Project Structure

```
BIMSC_Studio_HB1/
├── index.html                        # HTML entry point
├── package.json
├── vite.config.js                    # Active Vite config (Vue build)
├── tailwind.config.js                # Custom color tokens + animations
├── postcss.config.js
├── tsconfig.json
├── .env.example                      # Env variable template
├── APP_SPECIFICATION.md              # Full app specification
│
├── server/
│   ├── index.js                      # Express: Google OAuth, Speckle proxy, user API
│   └── db.js                         # PostgreSQL connection pool + schema init
│
└── src/
    ├── main.js                       # Vue app entry (createApp, Pinia, Router)
    ├── App.vue                       # Root component (AppShell vs bare layout logic)
    ├── style.css                     # Global Tailwind directives + component utilities
    │
    ├── router/
    │   └── index.js                  # Route definitions + navigation guards
    │
    ├── stores/
    │   └── userStore.js              # Single Pinia store (auth, team, avatar, members, meetings, actions)
    │
    ├── services/
    │   └── googleSheetsService.ts    # Fetches + parses published Google Sheets CSV
    │
    ├── data/
    │   └── sampleData.js             # Seed data: teams, members, timeline, meetings, actions, health
    │
    ├── components/
    │   ├── AppShell.vue              # Sticky header + nav tabs + animated bubble background
    │   ├── UserAvatar.vue            # Current user's blob avatar (reads userStore.avatarConfig)
    │   ├── MemberBlob.vue            # Generic member blob avatar (accepts member prop)
    │   ├── AvatarPreview.vue         # Live blob preview for AddMemberModal
    │   ├── AddMemberModal.vue        # Full-screen modal: add team member with avatar config
    │   ├── BreathingChart.vue        # SVG animated wave: filtration efficacy (dirty→clean air)
    │   ├── PorousVisualization.vue   # 200-floor bubble matrix: tower vital signs by zone
    │   ├── ProjectComplexity.vue     # SVG stepped line chart: project complexity weeks 1-7
    │   └── ProgramKPISelector.vue   # Program KPI week + space index selector with bullet charts
    │
    └── views/
        ├── LoginView.vue             # Google sign-in landing page
        ├── AuthCallback.vue          # OAuth success handler (/auth/success)
        ├── ProfileSetup.vue          # Team selection + Avatar Lab
        ├── DashboardView.vue         # Main overview: health, activity feed, all members
        ├── KPIDashboardView.vue      # KPI tabs (Program/Structure/Data/Vitals)
        ├── TimelineView.vue          # 10-week polyline timeline with deliverable cards
        ├── ViewerView.vue            # Speckle 3D BIM viewer with week slider
        ├── TeamsView.vue             # Team cards + all-members grid + add member
        └── TeamDetailView.vue        # Single team: members, meetings, actions, hours
```

---

## Views & Routing

| Route | View | Auth required | Description |
|---|---|---|---|
| `/` | `LoginView.vue` | No | Google sign-in button. Redirects authenticated users to `/dashboard`. |
| `/auth/success` | `AuthCallback.vue` | No | Receives OAuth query params, calls `userStore.login()`, routes to dashboard or profile. |
| `/profile` | `ProfileSetup.vue` | Yes | Choose team (Structure/Program/Data) and configure blob avatar. Saves to DB on confirm. |
| `/dashboard` | `DashboardView.vue` | Yes | Project health score, milestone tracker, recent activity feed, all team member blobs. |
| `/kpi` | `KPIDashboardView.vue` | Yes | Live KPI data from Google Sheets. Tabs: Program, Structure, Data, Vitals. |
| `/timeline` | `TimelineView.vue` | Yes | 10-week polyline timeline. Click week dots to expand deliverable cards per team. |
| `/viewer` | `ViewerView.vue` | Yes | Speckle 3D model viewer. Select week 1-10 via slider; weeks 1-5 have live models. |
| `/teams` | `TeamsView.vue` | Yes | Three team cards with stats. Full member grid. Add/remove members. |
| `/teams/:id` | `TeamDetailView.vue` | Yes | Per-team members, meetings, actions (with status), and hour totals. |

**Navigation guard logic** (`src/router/index.js`):
1. Logged-in user visiting `/` → redirect to `/dashboard` (or `/profile` if no team set)
2. Unauthenticated user visiting any protected route → redirect to `/`
3. Authenticated user with no team visiting `/dashboard` → redirect to `/profile`

**Shell vs bare layout** (`App.vue`): Routes `dashboard`, `kpi`, `timeline`, `viewer`, `teams`, `team-detail` render inside `AppShell` (header + nav + bubbles). Routes `login`, `auth-success`, `profile` render without the shell.

---

## Components

### `AppShell.vue`
Wraps all post-login views. Renders:
- Sticky header: project title, animated bubble background, current user info (photo or blob), Profile and Logout buttons
- Navigation tabs linking to Dashboard, KPI, Timeline, Viewer, Teams
- A `<slot>` where the active view is rendered

### `UserAvatar.vue` / `MemberBlob.vue` / `AvatarPreview.vue`
Animated SVG blob avatars. Each avatar is controlled by four parameters:

| Parameter | Effect |
|---|---|
| `complexity` | Number of SVG morph keyframes (more = more organic shape) |
| `speed` | CSS animation duration (lower = faster breathing) |
| `wobble` | SVG `feTurbulence` filter intensity (higher = more wobbly) |
| `shade` | Color index within the team's palette |

- `UserAvatar` reads from `userStore.avatarConfig` and `userStore.selectedTeam`
- `MemberBlob` accepts a `member` object prop (used in team member grids)
- `AvatarPreview` accepts all four values as props (used for live preview in the modal)

### `AddMemberModal.vue`
Full-screen overlay for adding a team member. Fields: name, role, team (dropdown), mood. Optional avatar configuration with 4 sliders and a live `AvatarPreview`. A "Match my avatar" checkbox copies the current user's avatar settings. Emits `submit` (with member data) and `close`.

### `BreathingChart.vue`
SVG wave chart in the Vitals KPI tab. Shows "dirty air" (red area) declining while "clean air" (green area) rises over time, representing the tower's filtration efficacy. Animated with CSS `@keyframes`.

### `PorousVisualization.vue`
700px tall interactive bubble matrix representing the 200-floor tower. Floors are grouped into 4 zones: North, Core, South, Atrium. Each bubble is colored by the dominant metric for that floor unit (red = air quality, blue = occupancy, green = structural load). Hover to see a tooltip with all three metric values.

### `ProjectComplexity.vue`
SVG stepped line chart showing project complexity increasing from 25% to 85% over weeks 1-7. Used in the Vitals KPI tab.

### `ProgramKPISelector.vue`
Week + space index filter dropdowns for the Program KPI category. Renders KPI cards (EPA, PPI, RCIR) with bullet charts, target vs actual values, and summary statistics. Persists selections to `localStorage`.

---

## State Management (Pinia)

Single store: `src/stores/userStore.js`. All state is persisted to `localStorage` under the key `bimsc_studio_data`.

### State shape

```js
{
  currentUser: {
    googleId, name, email, photoURL,
    givenName, familyName, locale, verifiedEmail
  },
  selectedTeam: 'structure' | 'program' | 'data',
  avatarConfig: { complexity, speed, wobble, shade },
  isLoggedIn: Boolean,
  teamMembers: { structure: [...], program: [...], data: [...] },
  teamMeetings: { structure: [...], program: [...], data: [...] },
  teamActions:  { structure: [...], program: [...], data: [...] },
  meetingNotes: [...],
  memberHours:  { [memberId]: [{ hours, description, date }] }
}
```

### Key getters

| Getter | Returns |
|---|---|
| `teamColor` | Tailwind color name for `selectedTeam` (`green`, `blue`, `red`) |
| `teamName` | Display name (`"Green Structure"`, `"Blue Program"`, `"Red Data"`) |
| `activeNotes` | Incomplete meeting notes |
| `completedNotes` | Completed meeting notes |

### Key actions

| Action | Purpose |
|---|---|
| `login(userData)` | Set `currentUser`, `isLoggedIn`, team (if returned from DB) |
| `logout()` | Clear all state and localStorage |
| `selectTeam(team)` | Set `selectedTeam`, persist |
| `updateAvatar(config)` | Update `avatarConfig`, persist |
| `addTeamMember(member)` | Push to `teamMembers[team]`, persist |
| `removeTeamMember(id, team)` | Remove from `teamMembers[team]`, persist |
| `addTeamMeeting(team, meeting)` | Push to `teamMeetings[team]`, persist |
| `addTeamAction(team, action)` | Push to `teamActions[team]`, persist |
| `updateActionStatus(team, id, status)` | Update action status, persist |
| `addMemberHours(memberId, entry)` | Append hours entry for a member |
| `getTotalMemberHours(memberId)` | Sum all hours for a member |

---

## External Integrations

### Google OAuth 2.0

Handled entirely in `server/index.js`.

1. `GET /auth/google` — redirects to Google's OAuth consent screen
2. `GET /auth/callback` — exchanges auth code for tokens, calls Google userinfo API, upserts user into PostgreSQL, redirects to `/auth/success?email=...&name=...&team=...`
3. The frontend `AuthCallback.vue` reads query params and calls `userStore.login()`

Required env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### Speckle 3D Viewer

Used in `ViewerView.vue` via `@speckle/viewer`.

- A `weekModelUrls` array maps weeks 1-10 to Speckle object URLs on `app.speckle.systems`
- Weeks 1-5 have real model URLs (stream ID: `3d70848e9c`); weeks 6-10 show an "In progress" state
- The URL is rewritten to use the local proxy path (`/streams/.../objects/...`) before loading
- The Vite dev proxy rewrites `/streams/**`, `/objects/**`, `/graphql` → `https://app.speckle.systems`, injecting the Bearer token server-side

To update models: edit the `weekModelUrls` array in [src/views/ViewerView.vue](src/views/ViewerView.vue).

### Google Sheets KPI Data

Handled in `src/services/googleSheetsService.ts`.

Fetches published Google Sheets as CSV — no API key needed. The published sheet ID is hardcoded but can be overridden with `VITE_GOOGLE_SHEETS_PUBLISHED_ID`.

| Tab | GID | Used for |
|---|---|---|
| DATA | `846484099` | Data team KPIs |
| STRUCTURE | `1045283988` | Structure team KPIs |
| PROGRAM | `631520491` | Program team KPIs (week + space index format) |

- `fetchKPIsByCategory(category)` — fetches and parses the correct sheet
- `getKPIsForSelection(sheetData, week, scenario)` — filters rows by week/scenario
- Structure/Data format: `Week | Scenario | KPI columns | Target row`
- Program format: `Week | col B | Space Index | Space Name | KPI columns | Target row`

If the sheet is republished or tabs are recreated, update the published ID or GIDs in `googleSheetsService.ts`.

---

## Design System

Custom Tailwind tokens defined in `tailwind.config.js`:

| Token | Team | Colors |
|---|---|---|
| `structure` | Green Structure | `#86efac` / `#10b981` / `#059669` |
| `program` | Blue Program | `#93c5fd` / `#3b82f6` / `#2563eb` |
| `data` | Red Data | `#fca5a5` / `#ef4444` / `#dc2626` |

Custom animations: `breathe`, `breathe-slow`, `float`, `bubble-rise`, `pulse-blob`, `slide-in`, `fade-in`

UI conventions:
- Light mode only (`bg-slate-50` base)
- White cards with subtle borders and shadows
- Team color used for accents, badges, and avatar blobs throughout
- Smooth transitions on all interactive elements

---

## Data & Sample Data

`src/data/sampleData.js` provides seed data for development and default state:

- **Teams & members:**
  - Structure: Charles Abi Chahine, Ramy Ayoub, Hani Karime
  - Program: Ramón García, Ahmad Baltaji, Mahmoud Mohamed
  - Data: Emilie El Chidiac, María Sánchez Domínguez, Lakzhmy Mari Zaro
- **`courseTimeline`** — 10 weeks of milestones with deliverables per team
- **`projectHealth`** — overall 87%, breakdown by schedule/budget/quality/team, risks, milestones
- **`recentActivity`** — 9 recent activity events
- **`actions`** — 8 sample action items
- **`meetings`** — 5 sample meetings
- **`kpiMetrics`** — 6 KPI metrics (embodied carbon, facade ratio, daylight factor, etc.)

User-added members, meetings, and actions are stored in the Pinia store (and persisted to `localStorage`). Views merge sample data with store data.

---

## Backend Server

`server/index.js` — Express app running on `PORT` (default `5174`):

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/google` | GET | Initiate Google OAuth redirect |
| `/auth/callback` | GET | OAuth code exchange + DB upsert + redirect |
| `/api/users/profile` | POST | Save `team` and `avatarConfig` to PostgreSQL |
| `/streams/**` | ALL | Proxy to Speckle (injects Bearer token) |
| `/objects/**` | ALL | Proxy to Speckle |
| `/graphql` | ALL | Proxy to Speckle |

`server/db.js` — PostgreSQL connection pool. On startup, creates the `users` table if it doesn't exist:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  name TEXT, email TEXT, photo_url TEXT,
  given_name TEXT, family_name TEXT, locale TEXT, verified_email BOOLEAN,
  team TEXT,
  avatar_speed NUMERIC, avatar_wobble NUMERIC,
  avatar_complexity NUMERIC, avatar_shade NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Additional Resources

- [APP_SPECIFICATION.md](APP_SPECIFICATION.md) — Full technical specification
- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vitejs.dev/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Speckle Viewer Docs](https://speckle.guide/dev/viewer.html)
- [Tailwind CSS](https://tailwindcss.com/)
