# Manpower Management — Super Admin Portal

The Super Admin Portal: the internal console for managing every client company (tenant) on the manpower management platform — onboarding, branches, staff access, subscriptions, and billing.

This is the first module of a larger manpower management system. It's built to stand on its own and to have more modules (the agency-facing app, the worker/candidate-facing app, etc.) added alongside it later without reworking the foundation.

## Stack

- **Frontend**: Next.js 16 (App Router) + React, TypeScript, Tailwind CSS, TanStack Query
- **Backend**: NestJS (Node.js), TypeScript
- **Database**: PostgreSQL, via TypeORM
- **Auth**: JWT access tokens (in memory, short-lived) + httpOnly refresh token cookie (rotated), role-based access control (RBAC)
- **File storage**: S3-compatible (Cloudflare R2 recommended, or AWS S3) — wired into config, not yet used by any feature
- **AI**: OpenAI API key wired into config, ready for OCR / document extraction / letter generation / an HR assistant as those features are built
- **Hosting**: Docker containers, deployable to any VPS (see below) or AWS

## Project layout

```
backend/    NestJS API (auth, tenants, branches, tenant users, subscription plans, billing, dashboard)
frontend/   Next.js Super Admin Portal UI
docker-compose.yml   Runs Postgres + backend + frontend together
Caddyfile             Optional reverse proxy config for free automatic HTTPS
```

## Running locally (without Docker)

You'll need Node.js 22+ and a local PostgreSQL server.

```bash
# 1. Database
createdb manpower_mgmt

# 2. Backend
cd backend
cp .env.example .env        # edit DB credentials if needed
npm install
npm run migration:run       # creates all tables
npm run seed                # creates default roles, plans, and a Super Admin login
npm run start:dev           # http://localhost:3001/api

# 3. Frontend (in a second terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

The seed script prints the Super Admin email/password it created (defaults to `admin@example.com` / `ChangeMe123!` unless you set `SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD` in `backend/.env` first). **Log in and change it immediately** if you use the default.

API docs (Swagger) are available at `http://localhost:3001/api/docs` in development.

## Running with Docker (recommended for a shared/staging/production server)

```bash
cp .env.example .env   # fill in real secrets — see comments in the file
docker compose up -d --build
docker compose exec backend npm run migration:run
docker compose exec backend npm run seed
```

The app is now running: frontend on port 3000, API on port 3001, Postgres persisted in a Docker volume.

To also get free automatic HTTPS on a real domain, edit `Caddyfile` with your domain names (each needs a DNS A record pointing at your server first), then:

```bash
docker compose --profile with-https up -d --build
```

## Free live demo on Render (no server to manage)

This repo includes a `render.yaml` blueprint that spins up the backend, frontend, and a Postgres database together, straight from GitHub — good for showing a working demo before committing to paid hosting.

1. Push this repo to GitHub (if you haven't already).
2. Create a free account at [render.com](https://render.com) and sign in.
3. Click **New → Blueprint**, connect this GitHub repo, and click **Apply**. Render reads `render.yaml` and provisions all three services automatically — no manual configuration needed.
4. First deploy takes a few minutes. Once it's live, your app is at `https://manpower-admin-frontend.onrender.com` (Render may append a suffix to the name if it's already taken elsewhere — check the actual URL it assigns you).
5. The Super Admin login is `admin@example.com`, with the password Render auto-generated for `SEED_SUPER_ADMIN_PASSWORD` — find it in the backend service's **Environment** tab on Render, then log in and change it.

Two things worth knowing about the free tier, so nothing feels broken later: the free web services "sleep" after 15 minutes of no traffic and take about a minute to wake back up on the next visit, and the free Postgres database **expires and is deleted 30 days after creation** unless you upgrade it. That makes this setup great for demos, but not for real tenant data — see the hosting options below once you're ready to go live for real.

## Where to host this cheaply

You asked for something modern, cheap to run, and simple to set up. A few honest options, roughly cheapest to easiest:

- **A single small VPS** (e.g. Hetzner, DigitalOcean, Linode — roughly $6–12/month for a box big enough for this stack early on) running the Docker Compose setup above. This is the cheapest path and matches the "Docker + VPS" stack you specified. You manage one server; Docker Compose handles the rest.
- **Managed containers** (e.g. Railway, Render, Fly.io) if you'd rather not manage a server yourself at all — costs a bit more than a raw VPS but they handle deploys, restarts, and TLS for you. Point them at this repo's `backend/Dockerfile` and `frontend/Dockerfile`.
- **AWS** (ECS or EC2 + the same Docker images) once you need more scale, more compliance controls, or you're already using AWS for other things. More powerful, but more to configure and typically more expensive at this stage.

For the database, running Postgres in the same Docker Compose setup is fine to start. If you'd rather not manage backups yourself, a managed Postgres add-on (Railway, Render, or Neon's free tier) removes that worry for a small monthly cost.

For file storage (resumes, documents, generated letters), **Cloudflare R2** is the cheapest option that's fully compatible with the AWS S3 code already wired into the backend — it has no egress fees, unlike S3, which matters once tenants start uploading and downloading documents regularly.

## Default roles seeded

| Role | Access |
|---|---|
| `SUPER_ADMIN` | Everything |
| `BILLING_ADMIN` | Dashboard, tenants (read-only), billing (read/write) |
| `SUPPORT_AGENT` | Dashboard, tenants, billing — all read-only |

Add more Super Admin Portal users (and assign them one of these roles) from the **Admins** page once logged in — that page is currently read-only in the UI; creating admins is available via the API (`POST /api/super-admins`) and can be wired into the UI as a next step.

## What's built vs. what's next

**Built and working end-to-end** (verified with real requests and a full browser click-through): login/logout with token refresh, tenant CRUD and lifecycle (onboarding → active → suspended), branches, tenant staff users, subscription plans and plan changes with a full history trail, invoices with a mark-paid flow, and a dashboard summary.

**Intentionally not built yet**, since they depend on decisions or assets not available at this stage:
- Pixel-matched UI to your actual designs — the current UI is a solid original design system (see `frontend/src/lib/status-config.ts` for the visual language), built while waiting on the exported screenshots from your Claude Design prototype. Send those over and the screens can be refined to match exactly.
- File upload / document storage features (S3/R2 config exists, no upload UI yet)
- OpenAI-backed features: OCR, document extraction, letter generation, HR assistant (API key config exists, no endpoints yet)
- Creating/editing Super Admin Portal users from the UI (API exists, UI is read-only)
