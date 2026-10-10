# Student Personal Dashboard

A local-first desktop dashboard for tracking study, habits, projects, tasks,
health, and personal progress. The Windows desktop app is built with Electron,
React, and a local FastAPI backend.

## Project layout

- `Premium Productivity Application/` — Electron shell and React interface
- `backend/` — FastAPI API and SQLite data model

Generated builds, dependencies, local databases, backups, and duplicate
prototypes are intentionally excluded from this repository. App data stays on
the user's computer in `%APPDATA%\GOD-HQ\god_hq.db` for compatibility with
existing installations.

## Build on Windows

1. Install Node.js 22 or newer and Python 3.11 or newer.
2. Install backend dependencies:

   ```powershell
   cd backend
   py -3 -m venv venv
   .\venv\Scripts\python.exe -m pip install -r requirements.txt
   cd ..
   ```

3. Install desktop dependencies and build the installer:

   ```powershell
   cd "Premium Productivity Application"
   npm ci
   npm run electron:build
   ```

The installer is written to `desktop-build/` and is not committed to the
source repository.
