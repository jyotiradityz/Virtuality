<!-- refreshed: 2026-10-11 -->
# Architecture

**Analysis Date:** 2026-10-11

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Frontend UI Layer                               │
│                         (React 19 + Framer Motion)                          │
├──────────────────────────┬──────────────────────────┬───────────────────────┤
│    Platform Hub          │       Coup Module        │       Hexo Module     │
│   `Frontend/src/pages/`  │   `Frontend/src/pages/`  │ `Frontend/src/pages/` │
│        `Home.tsx`        │  `CoupGame.tsx` & Setup  │  `HexoGame.tsx` & Lby │
└─────────────┬────────────┴─────────────┬────────────┴───────────┬───────────┘
              │                          │                        │
              │                          ▼                        │
              │       ┌──────────────────────────────────────┐    │
              │       │     Transport & State Management     │    │
              │       │ `Frontend/src/api/socketTransport.ts`│    │
              │       │   `Frontend/src/store/gameStore.ts`  │    │
              │       └──────────────────┬───────────────────┘    │
              │                          │ (WebSocket)            │
              ▼                          ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Backend Application Server                          │
│                         (Node.js + Express Server)                          │
│                           `Backend/src/server.ts`                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                          Socket.IO Gateway Router                           │
│             `Backend/src/modules/games/coup/coup.socket.ts`                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                        Coup Service & Orchestration                         │
│             `Backend/src/modules/games/coup/coup.service.ts`                │
├─────────────────────────────────────────────────────────────────────────────┤
│                        Server-Authoritative Engine                          │
│     `Backend/src/modules/games/coup/coup.engine.ts` (State Transitions)     │
│     `Backend/src/modules/games/coup/coup.validator.ts` (Rule Enforcer)      │
│     `Backend/src/modules/games/coup/coup.rules.ts` (Card Definitions)       │
│     `Backend/src/modules/games/coup/coup.serializer.ts` (Card Masking)      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Data & Persistence Layer                            │
│  In-Memory / Fast Cache: `Backend/src/modules/games/coup/coup.repository.ts` │
│  Relational Database: `Backend/prisma/schema.prisma` (PostgreSQL via Prisma)│
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Server Bootstrap | Initializes Express, HTTP server, CORS, and mounts socket routes | `Backend/src/server.ts` |
| Coup Socket Controller | Handles incoming WebSocket events (`LOBBY_CREATE`, `ACTION`, `BLOCK`, `CHALLENGE`, `PASS`), binds socket IDs | `Backend/src/modules/games/coup/coup.socket.ts` |
| Coup Service | Manages lobby lifecycle, player sessions, reconnection validation, game start dispatch | `Backend/src/modules/games/coup/coup.service.ts` |
| Coup Game Engine | Deterministic state machine executing actions, challenges, blocks, influence loss, deck management | `Backend/src/modules/games/coup/coup.engine.ts` |
| Coup Validator | Guard conditions verifying coin thresholds, mandatory coups, active turn player, target validity | `Backend/src/modules/games/coup/coup.validator.ts` |
| Coup Serializer | Censors hidden cards for opponents while keeping player's own hand and revealed cards visible | `Backend/src/modules/games/coup/coup.serializer.ts` |
| Coup Repository | In-memory storage of player sessions, socket-to-player mappings, and active game states | `Backend/src/modules/games/coup/coup.repository.ts` |
| Frontend Router | Configures client SPA routing for Home, Coup, Hexo, and Mafia | `Frontend/src/App.tsx` |
| Socket Transport | Implements client-side WebSocket communication conforming to `ITransport` | `Frontend/src/api/socketTransport.ts` |
| Mock Transport | Provides offline single-player experience with local bot simulation | `Frontend/src/api/transport.ts` |
| Coup Game View | Renders table layout, player seats, card hands, action consoles, and interactive modals | `Frontend/src/pages/CoupGame.tsx` |
| Hexo Game View | Self-contained Catan-style board generator, vertex/edge grid, dice rolling, and settlements | `Frontend/src/pages/HexoGame.tsx` |

## Pattern Overview

**Overall:** Modular Monolith with Server-Authoritative State Engine.

**Key Characteristics:**
- **Server as Source of Truth:** Clients cannot unilaterally update game states; they submit intent payloads (`CoupActionPayload`) over WebSockets.
- **Deterministic State Transforms:** Engine functions receive current `CoupGameState` and player input, return an updated clone `CoupGameState` without global side effects.
- **Information Hiding / Anti-Cheat:** Card values remain hidden on the server; `coup.serializer.ts` redacts hidden roles before broadcasting game state over sockets.
- **Dual Transport Pattern:** Frontend supports both live multiplayer via `SocketTransport` and client-side single-player bots via `MockTransport` conforming to the unified `ITransport` interface.

## Layers

**Presentation Layer:**
- Purpose: Render game tables, HUDs, action bars, and interactive modals.
- Location: `Frontend/src/pages/`, `Frontend/src/components/`
- Contains: React components, Framer Motion animations, Tailwind utility markup.
- Depends on: `Frontend/src/api/socketTransport.ts`, `Frontend/src/store/gameStore.ts`.
- Used by: End user in the browser.

**Transport & Gateway Layer:**
- Purpose: Bidirectional messaging between browser client and server.
- Location: `Frontend/src/api/`, `Backend/src/modules/games/coup/coup.socket.ts`
- Contains: Socket.IO event listeners, payload deserialization, connection reconnection handling.
- Depends on: `Backend/src/modules/games/coup/coup.service.ts`.
- Used by: Frontend hooks and pages.

**Domain & Engine Layer:**
- Purpose: Enforce game rules, resolve challenges, manage phase transitions.
- Location: `Backend/src/modules/games/coup/coup.engine.ts`, `coup.validator.ts`, `coup.rules.ts`
- Contains: Business rules, card decks, Fisher-Yates shuffle, turn rotation, win detection.
- Depends on: `Backend/src/modules/games/coup/coup.types.ts`.
- Used by: `Backend/src/modules/games/coup/coup.service.ts`.

**Persistence Layer:**
- Purpose: Maintain room metadata, active match states, user identity.
- Location: `Backend/src/modules/games/coup/coup.repository.ts`, `Backend/prisma/`
- Contains: In-memory maps, Prisma schema, PostgreSQL relational tables.
- Depends on: PostgreSQL database, `@prisma/client`.
- Used by: `Backend/src/modules/games/coup/coup.service.ts`.

## Data Flow

### Primary Request Path (Game Action Execution)

1. Player selects an action (e.g. Tax) in `Frontend/src/components/panels/LocalPlayerConsole.tsx`.
2. Action payload dispatched via `SocketTransport.sendAction()` (`Frontend/src/api/socketTransport.ts:82`).
3. Socket.IO server receives `COUP_ACTION` event (`Backend/src/modules/games/coup/coup.socket.ts`).
4. Event handler calls `CoupService.executeAction(matchId, playerId, action)` (`Backend/src/modules/games/coup/coup.service.ts:218`).
5. `CoupValidator.validateAction()` checks player turn, alive status, coin cost, mandatory coup (`Backend/src/modules/games/coup/coup.validator.ts:5`).
6. `CoupEngine.executeAction()` applies coin updates and sets phase to `ACTION_RESPONSE` (`Backend/src/modules/games/coup/coup.engine.ts:55`).
7. Sanitized state generated for each seat via `serializeGameStateForPlayer()` (`Backend/src/modules/games/coup/coup.serializer.ts`).
8. Socket broadcasts `COUP_STATE_UPDATE` to all room sockets (`Backend/src/modules/games/coup/coup.socket.ts`).
9. `Frontend/src/store/gameStore.ts` receives payload and updates UI.

### Secondary Flow: Challenge Resolution

1. Defending player clicks "Challenge" in `Frontend/src/components/modals/ChallengeModal.tsx`.
2. Emits `CHALLENGE` event to backend.
3. `CoupEngine.declareChallenge()` checks if the actor actually held the claimed role (`Backend/src/modules/games/coup/coup.engine.ts`).
4. If actor held role: challenger loses 1 influence (`promptLoseInfluence`), actor exchanges card into deck.
5. If actor lied: actor loses 1 influence, pending action is cancelled.
6. State broadcasts to all clients.

**State Management:**
- Backend maintains server state in `CoupRepository.matchStates` Map.
- Frontend synchronizes through `Zustand` store `useGameStore` (`Frontend/src/store/gameStore.ts`).

## Key Abstractions

**`CoupGameState`:**
- Purpose: Complete snapshot of a Coup match.
- Examples: `Backend/src/modules/games/coup/coup.types.ts:79`
- Pattern: Immutable state tree updated via pure engine methods.

**`ITransport`:**
- Purpose: Contract decoupling frontend UI from transport implementation (allows hot-swapping between Socket.IO and offline Mock bot engine).
- Examples: `Frontend/src/api/transport.ts:13`, `Frontend/src/api/socketTransport.ts:5`
- Pattern: Strategy / Adapter pattern.

## Entry Points

**Backend HTTP & Socket:**
- Location: `Backend/src/server.ts`
- Triggers: Node execution (`node dist/server.js` or `npm run dev`)
- Responsibilities: Binds HTTP port 4000, attaches CORS, initializes Coup socket listeners.

**Frontend Application:**
- Location: `Frontend/src/main.tsx` -> `Frontend/src/App.tsx`
- Triggers: Browser page load.
- Responsibilities: Mounts React tree, initializes React Router, renders navigation shell.

## Architectural Constraints

- **Single-threaded Event Loop:** Engine runs in Node.js event loop; actions execute synchronously without locks needed for in-memory operations.
- **Client Blindness:** Hidden card contents must never be transmitted to opponent clients.
- **Global In-Memory State:** Active match state in `CoupRepository` is process-bound; restarts terminate ongoing matches unless backed by Redis/PostgreSQL.

## Anti-Patterns

### Monolithic Frontend State Machine (Hexo)
**What happens:** Game rules, board graphs, robber mechanics, and resource distribution for Hexo are implemented entirely in a single React component (`Frontend/src/pages/HexoGame.tsx`).  
**Why it's wrong:** Violates the platform's core architectural requirement: "The server is the source of truth. The frontend should never validate game rules" (`README.md:52`, `README.md:300`).  
**Do this instead:** Follow the modular Coup pattern (`Backend/src/modules/games/coup/`), creating `Backend/src/modules/games/hexo/` with server-side rules and Socket.IO synchronization.

## Error Handling

**Strategy:** Typed exceptions caught at the boundary and returned as formatted errors to client sockets.

**Patterns:**
- Backend throws `CoupError` (`Backend/src/modules/games/coup/coup.errors.ts`).
- Socket gateway catches errors and emits `COUP_EVENTS.ERROR` with structured `{ code, message }` payload (`Backend/src/modules/games/coup/coup.socket.ts:27`).

## Cross-Cutting Concerns

**Logging:** Standard console stdout/stderr.  
**Validation:** Dedicated validator functions (`validateAction`, `validateBlock`, `validateChallenge` in `Backend/src/modules/games/coup/coup.validator.ts`).  
**Authentication:** Planned JWT middleware against Prisma `User` records.

---

*Architecture analysis: 2026-10-11*
