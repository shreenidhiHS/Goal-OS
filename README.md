# GoalOS

Local-first desktop productivity app that combines **task management** with **automatic activity tracking**.

Unlike traditional todo apps, GoalOS records how you spend your day and compares that to what you planned — entirely offline, on your machine.

- No accounts
- No cloud
- No backend
- No telemetry

## Vision

Help you answer three questions every day:

1. What did I plan?
2. What did I actually do?
3. How can I improve tomorrow?

## Features

- **Dashboard** — daily progress, screen/focus/idle time, productivity score, timeline
- **Tasks & Daily Planner** — create, prioritize, complete, and plan the day
- **Goals** — long-term objectives linked to progress
- **Activity tracking** — automatic active-window capture (polls every ~2s)
- **Reports** — time breakdown charts
- **Settings** — tracking, notifications, theme, startup options
- **Privacy-first** — SQLite database stored only in Electron `userData`

## Tech stack

| Layer | Stack |
|-------|--------|
| UI | React, TypeScript, Vite, Tailwind CSS |
| Desktop | Electron |
| State | Zustand |
| Database | SQLite (`better-sqlite3`) + Drizzle ORM |
| Forms / validation | React Hook Form, Zod |
| Charts | Recharts |
| UI primitives | Radix UI + Lucide |

## Architecture

```
src/
├── app/          # React renderer (Vite)
├── electron/     # Main process, preload, IPC, OS services
├── shared/       # IPC channels, types, Zod schemas
└── database/     # Drizzle schema, repositories, SQLite client
```

- **Dev:** Electron loads `http://localhost:3000` (Vite HMR)
- **Production:** Electron loads `dist/renderer/index.html` (static files)
- Renderer talks to the main process only via **IPC** (`window.electronAPI`). The UI never touches Node or SQLite directly.

## Requirements

- **Node.js** 22+ (recommended; Electron 43 expects a modern Node)
- macOS, Windows, or Linux
- On macOS, grant **Screen Recording** (and Accessibility if prompted) so activity tracking can read the active window

## Local development

### 1. Install

```bash
npm install
```

`postinstall` rebuilds native modules (`better-sqlite3`, etc.) for Electron via `electron-rebuild`.

If native modules fail later:

```bash
npm run rebuild
```

### 2. Run in development

```bash
npm run dev
```

This will:

1. Compile the Electron main/preload TypeScript
2. Start the Vite renderer on **http://localhost:3000**
3. Launch Electron once Vite is ready (`ELECTRON_DEV=1`)

Use the **GoalOS Electron window**. Opening `localhost:3000` in a browser will not have IPC or the database (`window.electronAPI` is injected by the preload script only inside Electron).

### 3. Production build (local)

```bash
npm run build
npm start
```

- `build` — Vite → `dist/renderer`, `tsc` → `dist/electron` (+ database/shared)
- `start` — runs the packaged entry `dist/electron/main.js` and loads the static HTML

### 4. Package installers

```bash
npm run package
```

Outputs platform installers under `release/` (DMG/ZIP on macOS, NSIS on Windows, AppImage on Linux).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite + Electron with hot reload |
| `npm run build` | Build renderer + main process |
| `npm start` | Run the production build locally |
| `npm run package` | Build + package with electron-builder |
| `npm run rebuild` | Rebuild native modules for Electron |
| `npm run db:generate` | Generate Drizzle migrations |

## Database

SQLite file is created automatically on first launch:

```
{app.getPath('userData')}/goalos.db
```

Examples:

- **macOS:** `~/Library/Application Support/goal-os/goalos.db`
- **Windows:** `%APPDATA%/goal-os/goalos.db`
- **Linux:** `~/.config/goal-os/goalos.db`

You do not need to create the database file manually.

## Troubleshooting

### `Electron API is not available`

You are viewing the Vite URL in a normal browser. Run `npm run dev` and use the desktop window.

### `app.whenReady` / `require('electron')` is a path string

Some environments set `ELECTRON_RUN_AS_NODE=1` (e.g. IDEs that wrap Electron). The npm scripts unset it with `env -u ELECTRON_RUN_AS_NODE`. If you launch Electron yourself:

```bash
env -u ELECTRON_RUN_AS_NODE ELECTRON_DEV=1 npx electron .
```

### Activity tracking empty on macOS

Grant Screen Recording to Electron / GoalOS under **System Settings → Privacy & Security**.

## Project docs

Product requirements and module specs live in [`.cursor/project.md`](.cursor/project.md).

## License

ISC
