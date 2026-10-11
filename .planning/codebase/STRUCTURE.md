# Codebase Structure

**Analysis Date:** 2026-10-11

## Directory Layout

```
Virtuality/
├── .agent/                             # Agent workflows, skills, and GSD tool configuration
├── Backend/                            # Node.js + Express + Socket.IO server
│   ├── .env                            # Environment secrets (uncommitted)
│   ├── package.json                    # Backend dependencies and scripts
│   ├── tsconfig.json                   # Backend TypeScript configuration
│   ├── prisma/                         # Prisma schema and migrations
│   │   └── schema.prisma               # Database models (PostgreSQL)
│   └── src/                            # Backend source code
│       ├── server.ts                   # Main server entry point
│       └── modules/                    # Feature and game modules
│           └── games/                  # Pluggable game modules
│               └── coup/               # Coup game server module
│                   ├── __tests__/      # Vitest test suite (actions, rules, e2e)
│                   ├── Summary/        # Test story reports and documentation
│                   ├── coup.cards.ts   # Card definitions, deck setup, shuffling
│                   ├── coup.engine.ts  # Core state transition machine
│                   ├── coup.errors.ts  # Typed error classes
│                   ├── coup.events.ts  # Socket event name constants
│                   ├── coup.reconnect.ts # Token generator and validator
│                   ├── coup.repository.ts# In-memory storage and session mappings
│                   ├── coup.rules.ts   # Action costs, role claims, rules
│                   ├── coup.serializer.ts# Masked client state projection
│                   ├── coup.service.ts # Orchestration and lobby management
│                   ├── coup.socket.ts  # Socket.IO connection & event handlers
│                   ├── coup.types.ts   # Complete TypeScript type definitions
│                   └── coup.validator.ts# Move and action validation logic
├── Frontend/                           # Vite + React + Tailwind frontend application
│   ├── package.json                    # Frontend dependencies and scripts
│   ├── index.html                      # HTML shell entry point
│   ├── vite.config.ts                  # Vite build configuration
│   ├── .oxlintrc.json                  # Oxlint configuration
│   ├── Hexo/                           # Hexo assets and specifications
│   │   ├── 3D Assets/                  # 3D tile and settlement graphics
│   │   └── PLAN.md                     # Hexo roadmap and specifications
│   ├── Mafia/                          # Mafia specifications
│   │   └── PLAN.md                     # Mafia roadmap (pending specification)
│   └── src/                            # Frontend application source
│       ├── main.tsx                    # React application bootstrap
│       ├── App.tsx                     # Top-level routing component
│       ├── index.css                   # Global CSS & Tailwind utilities
│       ├── api/                        # Transport interfaces and network clients
│       │   ├── transport.ts            # ITransport interface & MockTransport bot engine
│       │   └── socketTransport.ts      # Socket.IO transport implementation
│       ├── assets/                     # Platform imagery and branding
│       ├── components/                 # Reusable React components
│       │   ├── lobby/                  # Lobby screens and participant lists
│       │   ├── modals/                 # Action, challenge, and exchange modals
│       │   ├── panels/                 # Player consoles, action bars, logs
│       │   ├── shared/                 # Shared widgets (e.g. InfluenceCard)
│       │   └── table/                  # Table canvas, seat layout, coin animations
│       ├── config/                     # Platform configurations
│       │   └── games.ts                # Registered game registry and metadata
│       ├── game/                       # Client-side offline game logic (Coup bots)
│       │   ├── engine.ts               # Client-side Coup state handler for bots
│       │   └── rules.ts                # Client-side action rules and constants
│       ├── hooks/                      # Custom React hooks
│       │   ├── useGame.ts              # Transport connection and store sync hook
│       │   └── usePlayerPosition.ts    # Circular seat layout coordinates calculator
│       ├── pages/                      # Page view components
│       │   ├── Home.tsx                # Platform landing hub and game selector
│       │   ├── CoupGame.tsx            # Main Coup game board and table view
│       │   ├── CoupLobbyPage.tsx       # Coup multiplayer pre-game lobby room
│       │   ├── CoupSetup.tsx           # Coup create/join room landing page
│       │   ├── Hexo.tsx                # Hexo lobby setup and room creator
│       │   ├── HexoLobby.tsx           # Hexo multiplayer staging room
│       │   └── HexoGame.tsx            # Hexo game board, dice, and settlement canvas
│       ├── store/                      # Client state management
│       │   └── gameStore.ts            # Zustand global state store
│       ├── styles/                     # Component and game stylesheets
│       │   └── coup.css                # Custom theme variables and table styling
│       └── types/                      # Frontend TypeScript type declarations
│           └── game.ts                 # Coup frontend types and action payloads
└── README.md                           # Platform vision, roadmap, and guidelines
```

## Directory Purposes

**`Backend/src/modules/games/`:**
- Purpose: Self-contained backend modules for each game on the platform.
- Contains: Game engines, socket routers, validation logic, types, and automated tests.
- Key files: `coup/coup.engine.ts`, `coup/coup.socket.ts`, `coup/coup.service.ts`.

**`Frontend/src/pages/`:**
- Purpose: High-level screen views mapped to URL routes.
- Contains: Top-level page containers managing layout and query parameters.
- Key files: `Home.tsx`, `CoupGame.tsx`, `CoupSetup.tsx`, `HexoGame.tsx`.

**`Frontend/src/components/`:**
- Purpose: Composable visual elements partitioned by feature domain.
- Contains: `table/` (board seats and animations), `panels/` (controls and logs), `modals/` (dialogues).
- Key files: `table/GameTable.tsx`, `panels/LocalPlayerConsole.tsx`, `modals/ChallengeModal.tsx`.

**`Frontend/src/api/`:**
- Purpose: Transport abstraction layer separating UI from network protocol.
- Contains: `transport.ts` (abstract interface + local bot engine), `socketTransport.ts` (live WebSocket).
- Key files: `transport.ts`, `socketTransport.ts`.

## Key File Locations

**Entry Points:**
- `Backend/src/server.ts`: Initializes Express, Socket.IO, mounts endpoints, binds port.
- `Frontend/src/main.tsx`: React DOM mount point.
- `Frontend/src/App.tsx`: Central route mapping table.

**Configuration:**
- `Frontend/src/config/games.ts`: Master catalog of games displayed on the homepage.
- `Backend/prisma/schema.prisma`: Database schema definition for PostgreSQL.
- `Frontend/vite.config.ts`: Vite bundling, plugins, and LAN dev server configuration.
- `Backend/tsconfig.json` & `Frontend/tsconfig.json`: TypeScript compiler rules.

**Core Logic:**
- `Backend/src/modules/games/coup/coup.engine.ts`: Authoritative state transition engine for Coup.
- `Backend/src/modules/games/coup/coup.validator.ts`: Comprehensive action validation logic.
- `Frontend/src/game/engine.ts`: Client-side engine powering local bot simulations.
- `Frontend/src/pages/HexoGame.tsx`: Client-side board layout and state for Hexo.

**Testing:**
- `Backend/src/modules/games/coup/__tests__/`: Vitest test suites covering rules, challenges, actions, and e2e game flows.

## Naming Conventions

**Files:**
- Backend game modules: `[game].[aspect].ts` (e.g., `coup.engine.ts`, `coup.socket.ts`, `coup.types.ts`).
- React page components: PascalCase (e.g., `CoupGame.tsx`, `Home.tsx`).
- React sub-components: PascalCase (e.g., `GameTable.tsx`, `ChallengeModal.tsx`).
- Utilities, hooks, configs: camelCase (e.g., `useGame.ts`, `socketTransport.ts`, `games.ts`).
- Stylesheets: kebab-case or feature-scoped (e.g., `coup.css`, `index.css`).

**Directories:**
- Plural lower-case for feature containers: `components/`, `pages/`, `hooks/`, `modules/`, `games/`.
- Domain names for game packages: `coup/`, `hexo/`, `mafia/`.

## Where to Add New Code

**Adding a New Game to the Platform:**
1. **Backend Engine:** Create `Backend/src/modules/games/<gamename>/`:
   - Implement `<gamename>.types.ts` for all match and action models.
   - Implement `<gamename>.engine.ts` for pure state transitions.
   - Implement `<gamename>.validator.ts` for action validation.
   - Implement `<gamename>.service.ts` for lobby coordination.
   - Implement `<gamename>.socket.ts` for Socket.IO event handling.
   - Add unit tests in `<gamename>/__tests__/`.
2. **Mounting Backend Route:** Register the socket handler in `Backend/src/server.ts`:
   - `setup<GameName>SocketHandlers(io);`
3. **Database Schema (if persistent):** Add models in `Backend/prisma/schema.prisma` and run `npx prisma migrate dev`.
4. **Frontend Game Page:** Create `Frontend/src/pages/<GameName>Game.tsx` and pre-game setup pages in `Frontend/src/pages/`.
5. **Frontend Config & Router:**
   - Add game metadata (id, name, path, theme, player limits) to `GAMES` in `Frontend/src/config/games.ts`.
   - Register the route in `Frontend/src/App.tsx`.

**Adding Shared Utilities:**
- Shared frontend helpers: `Frontend/src/hooks/` or `Frontend/src/utils/`.
- Shared backend utilities: `Backend/src/utils/` or `Backend/src/shared/`.

## Special Directories

**`.planning/`:**
- Purpose: Stores GSD architecture maps, project specifications, and requirements.
- Generated: Semi-automated by GSD workflows.
- Committed: Configurable via `.planning/config.json`.

**`Backend/dist/` & `Frontend/dist/`:**
- Purpose: Compiled production outputs (`tsc` and `vite build`).
- Generated: Yes.
- Committed: No (ignored via `.gitignore`).

---

*Structure analysis: 2026-10-11*
