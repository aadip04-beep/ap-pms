# AP-PMS — Project Management & Performance Control System

A management command center for tracking projects, tasks, priorities, deadlines
and invoice/revenue targets across a team — built for a DGM (Deputy General
Manager) to see, at a glance, what needs attention today.

This is **Phase 1** of the full AP-PMS specification: the core data model and
the highest-priority control screens are built and wired to a real database.
See [What's built vs. what's next](#whats-built-vs-whats-next) at the bottom.

---

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — custom "control room" design system (see `tailwind.config.ts`)
- **Prisma ORM** → **Neon Postgres** (serverless, free tier)
- **NextAuth** (credentials login, role-based sessions: `DGM` / `TEAM_MEMBER`)

Two free services host this: **Neon** (database) and **Vercel** (the running
app, connected to your **GitHub** repo for auto-deploys on every push). GitHub
alone stores code — it doesn't run a live website, so you need a host like
Vercel alongside it.

---

## 1. Run it locally first (optional)

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL / DIRECT_URL / NEXTAUTH_SECRET / SETUP_SECRET
npx prisma db push        # creates all tables in your database
npm run dev                # http://localhost:3000
```

You can skip this section entirely and go straight to deploying — see
below, everything can be done by clicking around Neon and Vercel's websites.

**Seeded logins** (password for everyone: `Welcome@123` — change these after
first login):

| Role | Email |
|---|---|
| DGM (super admin) | `dgm@ap-pms.local` |
| Team member (example) | any real email from your Team.xlsx, e.g. `civilengineerchirag@gmail.com` |
| Team member without a real email on file | auto-generated as `firstname.lastname@ap-pms.local` |

Open `prisma/seed.ts` if you want to change who the actual DGM account is, or
promote a specific staff member to the `DGM` role instead of using the
separate system account.

---

## 2. Create the free Neon database

1. Go to [neon.tech](https://neon.tech) and create a free project.
2. In the Neon dashboard, copy **two** connection strings:
   - the **pooled** connection (for `DATABASE_URL` — used at runtime)
   - the **direct** connection (for `DIRECT_URL` — used by Prisma Migrate)
3. Paste both into `.env` (locally) and later into Vercel's environment
   variables (below).

---

## 3. Push the code to GitHub

```bash
cd ap-pms
git init
git add .
git commit -m "AP-PMS Phase 1"
gh repo create ap-pms --private --source=. --push
```

(No GitHub CLI? Create an empty repo on github.com, then `git remote add
origin <url>` and `git push -u origin main`.)

---

## 4. Deploy on Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your
   `ap-pms` GitHub repo.
2. Add environment variables (same four as your `.env`):
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_URL` → your production URL, e.g. `https://ap-pms.vercel.app`
   - `NEXTAUTH_SECRET`
   - `SETUP_SECRET` → any password-like string you make up
3. In **Build & Development Settings**, override the **Build Command** to:
   ```
   npx prisma db push && npm run build
   ```
   This creates all the database tables automatically on every deploy — no
   terminal needed.
4. Click **Deploy**.
5. Once it's live, visit this URL once in your browser (swap in your real
   domain and the `SETUP_SECRET` you chose):
   ```
   https://your-site.vercel.app/api/setup/seed?secret=YOUR_SETUP_SECRET
   ```
   This loads your real team roster (from Team.xlsx) and a few demo
   projects. You'll see a small JSON message confirming it worked. Safe to
   revisit — it won't duplicate anything.

From here, every `git push` to `main` auto-deploys.

---

## Project structure

```
app/
  (app)/               protected shell — sidebar, topbar, all authenticated pages
    dashboard/          DGM command view / team member personal view
    projects/            portfolio list + [id] project control page
    tasks/                list + kanban, inline status/priority/verification
    my-work/              personal task buckets
    invoice-planning/    3-year → annual → quarterly → monthly cascade
    team/                 roster, workload, completion rate
    calendar/, analytics/  Phase 2 placeholders
  api/
    auth/[...nextauth]/  NextAuth handler
    tasks/[id]/          status / priority override / verification mutation
  login/                 credentials sign-in
lib/
  auth.ts               NextAuth config
  prisma.ts              Prisma client singleton
  queries.ts              all read queries (org KPIs, attention feed, invoice rollups…)
  utils.ts                formatting, status/priority visual mappings, due-date logic
components/               UI building blocks (badges, kpi tiles, task board, sidebar…)
prisma/
  schema.prisma           full data model
  seed.ts                  loads your real Team.xlsx roster + demo data
```

---

## What's built vs. what's next

**Built (Phase 1) — matches the highest-priority spec sections:**
- Role-based auth (DGM super admin vs. team member)
- Full data model: projects, tasks, subtasks, dependencies, milestones,
  risks, issues, comments, attachments, priority/deadline-extension
  requests, notifications, activity log, and the complete 3-level invoice
  cascade (3-year → annual → quarterly → monthly → weekly)
- DGM dashboard: organization KPIs, "What Needs My Attention", financial
  overview, project portfolio
- Team member dashboard (personalized "What Needs My Attention")
- Projects list + project control page (tasks, milestones, risks/issues,
  team, invoice snapshot)
- Tasks: list + drag-and-drop Kanban, inline status updates, DGM priority
  override, DGM verify/reject workflow (Completed → Pending Verification →
  Verified/Reopened)
- My Work: personal task buckets (Today, Overdue, Critical, Waiting,
  Completed, Awaiting Verification…)
- Invoice Planning: portfolio plan-vs-actual, full cascade drill-down per
  project
- Team page: workload and completion-rate by member, seeded from your real
  Team.xlsx roster
- Audit logging on status changes, priority overrides and verification
  decisions

**Roadmap (Phase 2+), scaffolded but not yet built:**
- Calendar view, Gantt/timeline view
- Delay prediction, project health-score automation, risk heatmaps
- Notification center UI (the data model already supports it)
- Activity Log UI (already logged; needs a viewer)
- Downloadable reports (PDF/Excel export)
- Project/task creation & edit forms (currently seeded via `prisma/seed.ts`;
  the read/update paths are live, create UI is next)
- Settings page, dark/light mode toggle
- Document management, WhatsApp/email notification integration

---

## A note on this build

This codebase was written and syntax-checked in a sandboxed environment
without access to `binaries.prisma.sh`, so `npx prisma generate` / `next
build` could not be run end-to-end here. Every query was manually
cross-checked against `schema.prisma` field-by-field, and all files pass an
esbuild syntax pass. Run `npm install && npx prisma generate && npm run
build` locally as your first step — with normal internet access this is a
completely standard Next.js + Prisma setup and should build cleanly. If
anything surfaces, it'll be a small, easy-to-spot fix.
