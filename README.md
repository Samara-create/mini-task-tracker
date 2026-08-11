# Mini Task Tracker

A small full-stack app for creating, viewing, updating, and deleting tasks.

## What I built

- **Backend:** Node.js + Express REST API (`/backend`) exposing `GET /tasks`,
  `POST /tasks`, `PATCH /tasks/:id`, and `DELETE /tasks/:id`. Tasks are stored
  in memory in a JS array.
- **Frontend:** React (Vite) single-page app (`/frontend`) that fetches tasks
  from the backend, lets you add a task (title + optional description), change
  a task's status via a dropdown, and delete a task. All data comes from the
  backend over HTTP — nothing is hardcoded in the UI.
- **Validation:** A task cannot be created (or updated) with an empty title —
  enforced on both the frontend (before the request is sent) and the backend
  (the API rejects it with a 400 either way, so the rule holds even if you
  call the API directly). Status is restricted to `To Do` / `In Progress` /
  `Done`. Deleting or updating a task that doesn't exist returns a 404 instead
  of crashing the server.

## How to run it

You need [Node.js](https://nodejs.org) (v18+) installed. Two terminals, run
from the project root.

**Terminal 1 — backend**
```bash
cd backend
npm install
npm start
```
This starts the API on `http://localhost:5000`.

**Terminal 2 — frontend**
```bash
cd frontend
npm install
npm run dev
```
This starts the app on `http://localhost:5173`. Open that URL in your
browser.

No environment variables, API keys, or seed scripts are needed — the backend
seeds itself with one sample task on startup.

## Why this stack

I'm already comfortable and productive in this exact combination — React on
the frontend and Express on the backend — from building a production
real-estate site (Next.js/Express/PostgreSQL). For a scoped 3–5 hour
assignment I deliberately used plain React + Vite instead of Next.js (no
routing or SSR is needed for a single-page tracker) and in-memory storage
instead of PostgreSQL, per the brief's note that in-memory is fine and a real
database is a bonus rather than a requirement. This kept the whole build
focused on the actual CRUD logic and validation the rubric is scoring, rather
than on infrastructure.

## Assumptions & shortcuts

- Data is in-memory only — it resets whenever the backend server restarts.
  This matches the brief's "in-memory storage is fine" allowance.
- No authentication/user accounts — the brief describes a single user's task
  list, not a multi-user system.
- Status is restricted to three fixed values (`To Do`, `In Progress`,
  `Done`) rather than free text, to keep the UI and validation simple and
  consistent.
- CORS is fully open (`cors()` with no config) since this runs locally for
  evaluation, not in production.
