# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Discord Music Hub (`artifacts/discord-music`)
- **Kind**: React + Vite web app
- **Preview path**: `/`
- **Port**: 20076
- **Description**: SoundSync — a multi-platform music player (YouTube, Spotify, Deezer, Radio) with real-time room sync via WebSocket.
- **Features**:
  - Real-time room sync via WebSocket (`/api/ws`) — in-memory rooms, host/participant model
  - YouTube IFrame API for full video/audio playback
  - Deezer 30s previews via their public API
  - Spotify OAuth login + embedded iframe player (requires `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` secrets)
  - Radio stations via radio-browser.info API
  - i18n support (English / Spanish) with localStorage persistence
  - Global player overlay with per-platform colored UI

### API Server (`artifacts/api-server`)
- **Kind**: Express 5 API
- **Port**: 8080
- **Paths**: `/api`, `/api/ws`
- **WebSocket**: `ws` package, upgrade handled via `http.createServer()` — WebSocket server at `/api/ws`
- **Routes**: `/api/rooms` (CRUD), `/api/search/*` (YouTube/Deezer/Radio), `/api/auth/spotify/*` (OAuth)
- **Rooms**: In-memory (no DB required), default "general" room always exists
