# Mini Task Tracker

A small full-stack app for creating, viewing, updating, and deleting tasks.

## What I built

- **Backend:** Node.js + Express REST API (`/backend`) exposing `GET /tasks`,
  `POST /tasks`, `PATCH /tasks/:id`, and `DELETE /tasks/:id`. Tasks are
  persisted in **MySQL** via Sequelize, so data survives a server restart.
- **Frontend:** React (Vite) single-page app (`/frontend`) that fetches tasks
  from the backend, lets you add a task (title + optional description), change
  a task's status via a dropdown, and delete a task. All data comes from the
  backend over HTTP — nothing is hardcoded in the UI.
- **Validation:** A task cannot be created (or updated) with an empty title —
  enforced on both the frontend (before the request is sent) and the backend
  (both an explicit check and the Sequelize model itself reject it with a
  400). Status is restricted to `To Do` / `In Progress` / `Done` via a model
  enum. Fetching, updating, or deleting a task that doesn't exist returns a
  404 instead of crashing the server.

## How to run it

You need [Node.js](https://nodejs.org) (v18+) and a running MySQL server. The
easiest way to get one on Windows is **XAMPP** (bundles MySQL with no separate
install):

1. Install [XAMPP](https://www.apachefriends.org/) and open the XAMPP Control
   Panel.
2. Start the **MySQL** module (click Start next to MySQL).
3. Create the database — easiest via phpMyAdmin (Control Panel → MySQL →
   Admin → Databases tab → type `mini_task_tracker` → Create), or from a
   terminal:
```bash
   mysql -u root -e "CREATE DATABASE mini_task_tracker;"
```

Then, from the project root, two terminals:

**Terminal 1 — backend**
```bash
cd backend
npm install
copy .env.example .env    # Windows PowerShell: Copy-Item .env.example .env
# edit .env if your MySQL setup differs from the defaults (see below)
npm run seed               # optional: populates 4 sample tasks
npm start
```
This starts the API on `http://localhost:5000`. You should see
`Connected to MySQL` in the console. `.env` defaults assume XAMPP's default
setup: host `localhost`, port `3306`, user `root`, **blank password**.

**Terminal 2 — frontend**
```bash
cd frontend
npm install
npm run dev
```
This starts the app on `http://localhost:5173`. Open that URL in your
browser.

## Why this stack

I'm already comfortable and productive in this exact combination — React on
the frontend and Express on the backend — from building a production
real-estate site (Next.js/Express/PostgreSQL/Sequelize). For a scoped 3–5
hour assignment I used plain React + Vite instead of Next.js (no routing or
SSR is needed for a single-page tracker). I added MySQL via Sequelize as the
bonus persistence layer since it's the same ORM pattern I already use in
production, and Sequelize's model validation mapped cleanly onto the brief's
validation requirement (required title, enum status) with very little extra
code. A `seed.js` script is included so the app can be demoed with realistic
data immediately rather than starting empty.

## Assumptions & shortcuts

- **Setup step beyond a normal README:** this app requires a running MySQL
  server and a `mini_task_tracker` database to already exist (see "How to run
  it" above) — it will not start without one. `backend/.env.example` shows
  the expected connection settings.
- Sequelize's `sync()` auto-creates the `tasks` table on first run — no
  manual migration needed once the database itself exists.
- No authentication/user accounts — the brief describes a single user's task
  list, not a multi-user system.
- Status is restricted to three fixed values (`To Do`, `In Progress`,
  `Done`) rather than free text, to keep the UI and validation simple and
  consistent.
- CORS is fully open (`cors()` with no config) since this runs locally for
  evaluation, not in production.
- `.env` (with real DB credentials) is gitignored; `.env.example` documents
  the expected shape.