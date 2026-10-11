# Technology Stack

**Analysis Date:** 2026-10-11

## Languages

**Primary:**
- TypeScript 5.3.3 (`Backend/package.json`) - Backend services, Coup game engine, Socket.IO event handlers, Prisma models.
- TypeScript ~6.0.2 (`Frontend/package.json`) - Frontend web application, React components, state stores, transports.

**Secondary:**
- HTML5 (`Frontend/index.html`) - Web application shell and viewport configuration.
- CSS / Tailwind CSS v4 (`Frontend/src/index.css`, `Frontend/src/styles/coup.css`) - Global styles, game themes, custom board layouts, card animations.

## Runtime

**Environment:**
- Node.js v24.12.0 (ESM / NodeNext module resolution)

**Package Manager:**
- npm 10.8.2
- Lockfiles: `Backend/package-lock.json` (present), `Frontend/package-lock.json` (present)

## Frameworks

**Core:**
- Express 4.18.3 (`Backend/package.json`) - Backend HTTP server, REST health check (`Backend/src/server.ts`).
- React 19.2.7 & React DOM 19.2.7 (`Frontend/package.json`) - Frontend UI component framework.
- Socket.IO 4.7.4 (`Backend/src/server.ts`) - Real-time bidirectional WebSocket communication.
- Socket.IO Client 4.8.3 (`Frontend/src/api/socketTransport.ts`) - Real-time client transport.
- React Router DOM 7.18.0 (`Frontend/src/App.tsx`) - Client-side SPA routing (`/`, `/coup`, `/hexo`, `/mafia`).
- Zustand 5.0.14 (`Frontend/src/store/gameStore.ts`) - Lightweight client-side reactive game state store.
- TanStack React Query 5.101.1 (`Frontend/package.json`) - Server state management and caching.

**Testing:**
- Vitest 1.3.1 (`Backend/package.json`, `Backend/src/modules/games/coup/__tests__/`) - Backend unit, rule, challenge, and end-to-end game testing.

**Build/Dev:**
- Vite 8.1.0 (`Frontend/vite.config.ts`) - Frontend development server and bundle compiler.
- `@vitejs/plugin-react` 6.0.2 (`Frontend/vite.config.ts`) - Fast Refresh React plugin for Vite.
- `@tailwindcss/vite` 4.3.1 & Tailwind CSS 4.3.1 (`Frontend/vite.config.ts`, `Frontend/src/index.css`) - Modern CSS engine.
- `ts-node-dev` 2.0.0 (`Backend/package.json`) - Backend development server with automatic restart and transpile-only mode.
- `oxlint` 1.69.0 (`Frontend/.oxlintrc.json`) - High-performance JavaScript/TypeScript linter.

## Key Dependencies

**Critical:**
- `socket.io` 4.7.4 & `socket.io-client` 4.8.3 - Server-authoritative multiplayer synchronization, room broadcasts, reconnect mechanics.
- `@prisma/client` 5.10.0 (`Backend/prisma/schema.prisma`) - Type-safe database ORM for Users, Lobbies, and Match history.
- `framer-motion` 12.42.0 (`Frontend/src/pages/HexoGame.tsx`, `Frontend/src/pages/CoupGame.tsx`, `Frontend/src/pages/Home.tsx`) - Micro-animations, card reveals, dice rolls, UI transitions.
- `lucide-react` 1.24.0 (`Frontend/package.json`) - UI icon suite for game consoles, headers, and controls.

**Infrastructure:**
- `cors` 2.8.5 (`Backend/src/server.ts`) - Cross-origin resource sharing for HTTP and WebSockets.
- `dotenv` 16.4.5 (`Backend/package.json`) - Environment configuration loader.
- `ioredis` 5.3.2 (`Backend/package.json`) - Redis client for pub/sub messaging and state caching.
- `jsonwebtoken` 9.0.2 (`Backend/package.json`) - Authentication token creation and verification.

## Configuration

**Environment:**
- Backend reads environment variables via `dotenv` in `Backend/src/server.ts`.
- `Backend/.env` file present (contains `DATABASE_URL`, `PORT`, etc. — never committed to source control).
- Default port fallback: `PORT=4000` (`Backend/src/server.ts`). Default frontend dev server port: `5173` (`Frontend/vite.config.ts`).

**Build:**
- `Backend/tsconfig.json` - Target `ES2022`, module `NodeNext`, moduleResolution `NodeNext`, strict mode enabled, outDir `./dist`.
- `Frontend/tsconfig.json`, `Frontend/tsconfig.app.json`, `Frontend/tsconfig.node.json` - Strict TypeScript configurations for browser and bundler environments.
- `Frontend/vite.config.ts` - Hosts on `0.0.0.0:5173` with React and Tailwind plugins.
- `Frontend/.oxlintrc.json` - Lint rules for React hooks and component exports.

## Platform Requirements

**Development:**
- Node.js v20+ runtime with npm.
- Local development works out-of-the-box using the in-memory fallback store (`Backend/src/modules/games/coup/coup.repository.ts`) or requires a PostgreSQL instance for Prisma migrations (`npx prisma migrate dev`).
- Local ports: 4000 (Backend API & Socket.IO), 5173 (Frontend Vite dev server).

**Production:**
- Frontend: Static host / CDN deployment (e.g. Vercel).
- Backend: Containerized Node.js service (e.g. Railway) running `node dist/server.js`.
- Database: Hosted PostgreSQL (Railway / Supabase) with Redis (Upstash) for session synchronization.

---

*Stack analysis: 2026-10-11*
