# Codebase Concerns

**Analysis Date:** 2026-10-11

## Tech Debt

**Hexo Monolithic Frontend Architecture:**
- Issue: The Hexo game implementation (`Frontend/src/pages/HexoGame.tsx`) is an 1,853-line monolithic React component. It handles hex board generation, vertex mathematics, settlement placements, dice rolling, robber logic, resource trading, and UI rendering entirely on the client.
- Files: `Frontend/src/pages/HexoGame.tsx`, `Frontend/src/pages/HexoLobby.tsx`, `Frontend/Hexo/PLAN.md`.
- Impact: Violates the core architecture principle stated in `README.md:300` ("Backend is always the source of truth. Frontend should only render the current game state"). Without a backend engine, Hexo cannot support authoritative multiplayer, anti-cheat, or spectator modes.
- Fix approach: Extract Hexo game logic into a dedicated backend module (`Backend/src/modules/games/hexo/`) matching the Coup pattern (`hexo.engine.ts`, `hexo.validator.ts`, `hexo.socket.ts`). Refactor `HexoGame.tsx` into modular visual components (`HexBoard.tsx`, `ResourceBar.tsx`, `TradeModal.tsx`).

**In-Memory State Persistence in Coup Repository:**
- Issue: `Backend/src/modules/games/coup/coup.repository.ts` stores active matches, player sessions, and lobby codes in static JavaScript Maps (`private static matchStates = new Map<string, CoupGameState>()`).
- Files: `Backend/src/modules/games/coup/coup.repository.ts`, `Backend/src/modules/games/coup/coup.service.ts`.
- Impact: If the Node.js server crashes or restarts, all active multiplayer games and player tokens are erased. The Prisma models `CoupMatchState` and `CoupMatchPlayer` exist in `Backend/prisma/schema.prisma` but are not yet synced by `CoupRepository`.
- Fix approach: Implement a database/cache persistence layer in `CoupRepository` that asynchronously persists match updates to Prisma PostgreSQL or Upstash Redis, using in-memory Maps purely as a read-through write-back cache.

**Dual Engine Logic for Coup:**
- Issue: Two separate implementations of the Coup rules exist: the server engine (`Backend/src/modules/games/coup/coup.engine.ts`) and the client-side bot engine (`Frontend/src/game/engine.ts`).
- Files: `Backend/src/modules/games/coup/coup.engine.ts`, `Frontend/src/game/engine.ts`.
- Impact: Divergence in rule logic, double the maintenance overhead for bug fixes, and inconsistent behavior between offline singleplayer and online multiplayer.
- Fix approach: Share the engine via a shared package or run bot simulations against the backend via socket or headless server instances.

## Known Bugs & Gaps

**Missing Mafia Implementation:**
- Symptoms: Navigating to `/mafia` shows a "Coming Soon" stub; `Frontend/Mafia/PLAN.md` is empty (0 bytes).
- Files: `Frontend/Mafia/PLAN.md`, `Frontend/src/App.tsx:21-46`.
- Trigger: Clicking "Play Now" on Mafia from the homepage (`Frontend/src/pages/Home.tsx`).
- Workaround: Disabled "Coming Soon" button currently blocks progression.

**Frontend Test Runner Missing:**
- Symptoms: `Frontend/package.json` contains no test runner script (`npm test` does not exist in `Frontend/`). Only `Backend` has Vitest configured.
- Files: `Frontend/package.json`.
- Trigger: Running automated tests across the monorepo.
- Workaround: Tests currently run in `Backend/` directory only.

## Security Considerations

**Permissive Socket.IO CORS Configuration:**
- Risk: Cross-origin requests from arbitrary origins are accepted.
- Files: `Backend/src/server.ts:13-16`.
- Current mitigation: Origin set to `'*'` with `GET`, `POST` methods allowed for local WiFi / LAN testing.
- Recommendations: Restrict CORS origins in production using environment variables (`FRONTEND_URL` / `ALLOWED_ORIGINS`).

**Unauthenticated Socket Connections:**
- Risk: Any client can issue `lobby:create` or `lobby:join` using arbitrary usernames without credential verification.
- Files: `Backend/src/modules/games/coup/coup.socket.ts:15-18`.
- Current mitigation: Basic ephemeral ID generation (`user_${socket.id.substring(0, 5)}`).
- Recommendations: Implement Socket.IO JWT authentication middleware verifying the JWT against the Prisma `User` record prior to connection.

## Performance Bottlenecks

**Hexo SVG Board Rendering & Vertex Recalculations:**
- Problem: `Frontend/src/pages/HexoGame.tsx` calculates dozens of hex coordinate polygons and vertex collision geometries on every render loop.
- Files: `Frontend/src/pages/HexoGame.tsx:1100-1400`.
- Cause: Complex inline geometric projections in a large React component without component virtualization.
- Improvement path: Memoize board vertices with `useMemo` and separate static board layers (background tiles) from dynamic interactive layers (settlements, roads, dice overlays).

## Fragile Areas

**Coup Turn & Challenge Timeout Timers:**
- Files: `Backend/src/modules/games/coup/coup.rules.ts:60` (`RESPONSE_TIMEOUT_MS = 30000`), `Backend/src/modules/games/coup/coup.engine.ts`.
- Why fragile: If a client loses connection during an `ACTION_RESPONSE` window and disconnects without responding, the turn cycle must auto-pass or forfeit cleanly after the deadline.
- Safe modification: Ensure reconnect tests (`Backend/src/modules/games/coup/__tests__/coup.reconnect.test.ts`) are always executed when modifying response deadlines or reconnect logic.

## Scaling Limits

**Single-Node Memory Limits:**
- Current capacity: Single Node.js process managing active lobbies in memory.
- Limit: Cannot horizontally scale to multiple server instances or clusters without breaking WebSocket room synchronization and shared match state.
- Scaling path: Introduce `@socket.io/redis-adapter` backed by Upstash Redis to broadcast events across multiple backend workers.

## Dependencies at Risk

**React 19 & Tailwind CSS v4 Ecosystem Early Adopters:**
- Risk: React 19.2.7 and Tailwind CSS v4.3.1 are very recent major releases; some third-party React libraries have peer-dependency warnings or require specific bundler flags (`@tailwindcss/vite`).
- Impact: Potential compatibility friction when adding older React component libraries.
- Migration plan: Standardize on first-party plugins and pure CSS variables / Lucide icons.

## Missing Critical Features

**Platform Unified Authentication & Profiles:**
- Problem: `README.md:19-29` specifies Google/Email login, User Profiles, Friends, Match History, and Achievements. None of these REST API endpoints are currently implemented in `Backend/src/server.ts`.
- Blocks: Cross-game user stats, friend invites, and persistent account progression.

## Test Coverage Gaps

**Hexo Game Logic Test Coverage:**
- What's not tested: Entire Catan/Hexo rule engine (dice rolling, resource allocation, robber displacement, building validation, victory points).
- Files: `Frontend/src/pages/HexoGame.tsx`.
- Risk: Regressions or board state desynchronization can occur unnoticed.
- Priority: High.

**Frontend UI Component Tests:**
- What's not tested: React components, modals, and user interaction in `Frontend/src/components/`.
- Files: `Frontend/src/components/table/`, `Frontend/src/components/modals/`.
- Risk: UI rendering breaks or race conditions with Socket transport updates.
- Priority: Medium.

---

*Concerns audit: 2026-10-11*
