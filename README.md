# AR Trust Travel & Tourism — ERP (Monorepo)

A travel & tourism ERP plus public website, built as a **monorepo**:

| Folder | Stack | Role |
| --- | --- | --- |
| `apps/web` | **Next.js 15** + React 19 + Tailwind v4 + TypeScript | Frontend (public website + ERP dashboard) |
| `apps/api` | **Express** + **Prisma** + **MySQL** + TypeScript | REST API backend |
| `packages/shared` | TypeScript | Types/contracts shared by web and api |

> **Stack:** Next.js + Express + Node.js + MySQL + Prisma. The frontend and
> backend are **separate apps** in one repository (npm workspaces).

---

## Prerequisites

- **Node.js ≥ 20.19**
- **MySQL 8** running locally (XAMPP, MySQL Installer, or Docker)
- npm 10+ (ships with Node)

---

## First-time setup

```bash
# 1. Install all workspace dependencies (from the repo root)
npm install

# 2. Create a MySQL database
#    e.g. in MySQL shell:  CREATE DATABASE ar_trust_erp;

# 3. Configure the API env
cp apps/api/.env.example apps/api/.env
#    then edit DATABASE_URL and JWT_SECRET in apps/api/.env

# 4. Configure the web env
cp apps/web/.env.example apps/web/.env.local

# 5. Create the database tables and generate the Prisma client
npm run db:migrate         # creates tables from prisma/schema.prisma
npm run db:seed            # creates the first super-admin user
```

The seed creates an admin — default `admin` / `admin123`
(override with `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`). **Change it before production.**

---

## Running in development

```bash
npm run dev          # runs API (:4000) and web (:3000) together
# or individually:
npm run dev:api
npm run dev:web
```

- Web: http://localhost:3000
- API: http://localhost:4000/health

---

## Useful scripts (root)

| Command | What it does |
| --- | --- |
| `npm run dev` | Run web + api together |
| `npm run build` | Build api then web |
| `npm run db:migrate` | Apply Prisma schema to MySQL |
| `npm run db:seed` | Seed the admin user |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

---

## Backend module pattern

Each feature in `apps/api/src/modules/<name>/` has three files:

- `*.routes.ts` — URL → handler mapping (+ `authenticate` / `authorize`)
- `*.controller.ts` — request parsing/validation (Zod) + response shaping
- `*.service.ts` — business logic + Prisma queries

**`auth`** (register / login / me, JWT + bcrypt) and **`bookings`** (full CRUD)
are hand-written and act as the template. Every other entity (fleet, drivers,
tour-guides, guests, guest-tiers, hotel-vendors, hotel-bookings, employees,
expenses, currencies, tour-packages, service-categories, airport-desks,
notifications) gets full CRUD automatically via the generic factory in
`src/lib/crud.factory.ts`, wired up in `src/modules/resources.ts`. `GET /api`
lists every available collection.

Each generated collection supports: `GET /api/<name>` (with `?search`, `?skip`,
`?take` and per-entity filters), `GET/POST/PATCH/DELETE /api/<name>/:id`.
All routes require a Bearer token. All responses use the envelope
`{ ok: true, data }` or `{ ok: false, error }`.

---

## Migration status & plan

This project was converted from a single Vite + React SPA (all data in
`localStorage` / mock files) into the monorepo above. The conversion uses a
**strangler approach** so the app keeps working at every step.

### ✅ Done (Phase 1 — foundation)
- Monorepo (npm workspaces) with `apps/web`, `apps/api`, `packages/shared`
- Express + Prisma + MySQL backend, full schema for every ERP entity
- `auth` module (JWT) + **full CRUD API for all 16 entities** (hand-written
  `bookings` template + generic factory for the rest), with auth guards,
  search/filter/pagination — verified booting, routing, and auth-guarding
- Next.js frontend that runs the **entire existing UI** via an optional
  catch-all route (`app/[[...slug]]`), SSR disabled, images handled like Vite
- Shared types + typed API client (`apps/web/lib/api.ts`)
- **Live MySQL database** — schema migrated, 9 demo users + the full rich
  dataset seeded (`npm run db:seed` then `npm run db:seed:data`)
- **Auth fully wired end-to-end** — the app's login/signup call the real API
  (JWT + bcrypt), store the token, and fall back to localStorage when the API
  is unreachable. Verified: UI login → `POST /api/auth/login 200` → dashboard.
- **All business data is now database-driven (no mock/localStorage).** On login
  the app hydrates every collection from the API, and every create/update/delete
  writes straight back to MySQL via `apps/web/lib/data.ts` (`useResourceSync`).
  Verified end-to-end: a value edited directly in MySQL appears in the UI, and a
  UI action ("Approve Lead") persists to MySQL (`PATCH … 200`, row updated).

### 🔜 Remaining hardening (for full production)
1. **Require a real login.** For demo convenience `AppContext` still defaults
   `isAuthenticated` to `true`; when there's no JWT the hydrate call fails and
   the app shows mock fallback data. For production, default it to `false` so an
   unauthenticated visitor always sees the login screen.
2. **A few config-only collections still use localStorage** (exchange rates,
   shift drawer, salary records, audit logs, package categories, category map).
   Add Prisma models + endpoints for any you want persisted server-side.
3. **Surface sync errors in the UI.** `useResourceSync` currently logs failed
   writes to the console — add a toast/retry for production.
4. **(Optional) Split the tab shell into real Next routes** for SEO/perf: public
   pages as server components under `app/(public)/`, dashboard under
   `app/(dashboard)/`, replacing the `activeTab` switch in `App.tsx`.

### Legacy files (safe to delete once Phase 2 is verified)
Old Vite/static-server artifacts remain at the repo root for reference:
`index.html`, `vite.config.ts`, `server.js`, `metadata.json`, and the old deploy
configs. They are **not** used by the Next.js app.

---

## Deployment

- **Web:** `npm run build -w @ar-trust/web` → `npm run start -w @ar-trust/web`
  (Vercel works out of the box; set the project root to `apps/web`).
- **API:** `npm run build -w @ar-trust/api` → `npm run start -w @ar-trust/api`
  (run `prisma migrate deploy` on the server). On Hostinger, MySQL is available
  by default — point `DATABASE_URL` at it. See `HOSTINGER-DEPLOY.md`.
