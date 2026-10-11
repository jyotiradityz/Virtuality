# External Integrations

**Analysis Date:** 2026-10-11

## APIs & External Services

**Third-Party APIs:**
- None detected currently. The platform currently operates self-contained without third-party external SaaS APIs (no payment gateways, email delivery, or external analytics integrations).

## Data Storage

**Databases:**
- PostgreSQL via Prisma ORM:
  - Models defined in `Backend/prisma/schema.prisma` (`User`, `Lobby`, `LobbyPlayer`, `Match`, `CoupMatchState`, `CoupMatchPlayer`).
  - Connection configured via `DATABASE_URL` environment variable (`Backend/prisma/schema.prisma:3`).
  - Client generated via `@prisma/client` (`Backend/package.json`).
- In-Memory Repository & Cache:
  - Implemented in `Backend/src/modules/games/coup/coup.repository.ts`.
  - Employs static `Map` instances (`sessions`, `socketToPlayer`, `matchStates`, `lobbyCodeToId`) for sub-millisecond retrieval and offline development without database dependencies.

**File Storage:**
- Local filesystem only:
  - 3D Hexo board tiles and structures stored under `Frontend/Hexo/3D Assets/` (`Frontend/src/pages/HexoGame.tsx:6-15`).
  - Static platform images stored in `Frontend/src/assets/` (`Frontend/src/pages/Hexo.tsx:4`).

**Caching:**
- `ioredis` dependency installed in `Backend/package.json:18`.
- In-memory Map cache currently serves as active cache in `Backend/src/modules/games/coup/coup.repository.ts`.
- Planned Upstash Redis integration for production multi-instance state sync (`README.md:163`).

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication schema designed in `Backend/prisma/schema.prisma:10-22` and supported by `jsonwebtoken` (`Backend/package.json:19`).
- Ephemeral Socket Sessions: Currently, active socket connections in `Backend/src/modules/games/coup/coup.socket.ts:15-16` generate session IDs based on socket ID or client query parameters (`name`), issuing signed reconnect tokens (`generateReconnectToken` in `Backend/src/modules/games/coup/coup.reconnect.ts`).

## Monitoring & Observability

**Error Tracking:**
- Structured error handling via `CoupError` in `Backend/src/modules/games/coup/coup.errors.ts` with typed error codes (`INVALID_ACTION`, `NOT_YOUR_TURN`, `NOT_IN_GAME`, `LOBBY_NOT_FOUND`, etc.).
- Errors emitted directly to clients via `COUP_EVENTS.ERROR` over WebSockets (`Backend/src/modules/games/coup/coup.socket.ts:27`).

**Logs:**
- Standard process console logging (`console.log`, `console.error`) in server bootstrap (`Backend/src/server.ts:27`) and client transports (`Frontend/src/api/transport.ts:34`).
- Health check HTTP endpoint: `GET /health` (`Backend/src/server.ts:19-21`) returning service status, name, and ISO timestamp.

## CI/CD & Deployment

**Hosting:**
- Frontend: Intended for Vercel deployment (`README.md:151`).
- Backend: Intended for Railway container deployment (`README.md:155`).

**CI Pipeline:**
- None configured yet. No `.github/workflows` or automated CI runners currently defined in the repository.

## Environment Configuration

**Required env vars:**
- `PORT` - Port for Express HTTP server and Socket.IO listener (default: `4000`, `Backend/src/server.ts:25`).
- `DATABASE_URL` - PostgreSQL connection string used by Prisma (`Backend/prisma/schema.prisma:3`).

**Secrets location:**
- `Backend/.env` file present (untracked in git, ignored by `.gitignore:12-15`).

## Webhooks & Callbacks

**Incoming:**
- None currently configured.

**Outgoing:**
- None currently configured.

---

*Integration audit: 2026-10-11*
