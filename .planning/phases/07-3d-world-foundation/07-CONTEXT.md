# Phase 7: 3D World Foundation (R3F Canvas, Seat Layout & Turn Camera) - Context

**Gathered:** 2026-10-15
**Status:** Ready for planning
**Source:** Inline user brief to `/gsd-plan-phase` + clarifying Q&A (treated as PRD express path)

<domain>
## Phase Boundary

This is the first phase of moving the Coup frontend to a Three.js / React Three Fiber (R3F) 3D experience that runs **alongside** the existing 2D UI and is chosen with a 2D/3D toggle.

Phase 7 delivers only a **test sandbox**:
- A 3D world canvas (R3F) on its own route.
- A placeholder table whose top matches the user's table model coordinates.
- One placeholder cube per player (stands in for chair + person), seated around the table for 2–6 players.
- A camera that glides around the table to the active player's seat, plus a free-orbit debug toggle.
- A 2D/3D toggle pill and debug HUD (player count, prev/next turn).

There is NO game logic, NO socket/store binding to real game state, and NO real models (GLB) in this phase.
</domain>

<decisions>
## Implementation Decisions

### Isolation (LOCKED)
- **Do not modify any existing 2D files** (`CoupGame.tsx`, `GameTable.tsx`, `PlayerSeat.tsx`, `usePlayerPosition.ts`, `coup.css`, modals, panels, etc.).
- The one allowed edit to an existing file is `Frontend/src/App.tsx`: add a lazy-loaded route `/coup/3d`. React Router ranks static segments above dynamic ones, so `/coup/3d` takes priority over `/coup/:lobbyCode`.
- All new 3D code lives under `Frontend/src/three/`, plus the page `Frontend/src/pages/Coup3DSandbox.tsx`.
- The sandbox page is loaded with `React.lazy` so `three` ends up in its own chunk and does not grow the 2D bundle.

### Stack (LOCKED)
- `three`, `@react-three/fiber@^9` (needed for React 19), `@react-three/drei@^10`, dev dep `@types/three`.
- Styling follows the project convention (Tailwind v4 utility classes plus the existing dark glass look). No new CSS framework.

### Coordinate System (LOCKED: user confirmed Blender Z-up)
- The user gave table corners as (-16,-16,16), (16,-16,16), (-16,16,16), (16,16,16), which are Blender Z-up coordinates.
- In Three.js (Y-up) the **tabletop is the plane y = 16, spanning x ∈ [-16, 16], z ∈ [-16, 16]**. Corners: (±16, 16, ±16).
- Floor is y = 0. Table center look-at target is (0, 16, 0).
- 1 world unit = 1 Blender unit, so the real GLB models drop in later with no rescaling.

### Seat Layout (LOCKED)
- Supported player counts: **2, 3, 4, 5, 6**.
- Seat angle: `θ_i = i · 2π / n`. Seat 0 sits at the front (+Z). Direction `d = (sin θ, 0, cos θ)`.
  - 2p → 0°, 180° (players face each other across the table)
  - 3p → 120° spacing
  - 4p → 90° spacing (one player at the middle of each table side)
  - 5p → 72° spacing
  - 6p → 60° spacing
- The seat sits a fixed gap outside the **square** table edge, measured along `d`: `edge(θ) = 16 / max(|sin θ|, |cos θ|)`, `seatRadius = edge(θ) + SEAT_GAP`. A plain circle would push 45° seats into the table corners, which is why the square edge is used.
- Each seat is a single cube for now (chair + body). It faces the table center: `rotationY = θ + π`, so local +Z points at the center. A small front marker on the local +Z face shows which way it faces.

### Turn Camera (LOCKED: glide + free-orbit debug)
- The camera sits behind and above the active seat at azimuth θ_active and looks at (0, 16, 0).
- When the turn changes, the camera **glides around the table along the shortest arc**. It damps azimuth, radius and height together each frame (no snapping and no straight-line cut through the table).
- **Free Orbit** debug toggle: when ON, drei `OrbitControls` (target (0,16,0)) takes over and the rig pauses. When OFF, the rig picks up from the camera's current pose and glides back to the active seat.

### 2D/3D Toggle (LOCKED)
- A floating pill with "2D | 3D" on the sandbox page. 3D is active there; clicking 2D navigates to `/coup` (the existing 2D experience).
- The preference is stored in a small persisted zustand store (`localStorage`) so later phases can let `CoupGame` read it. The stored value is validated, and anything other than `'2d'`/`'3d'` falls back to `'2d'`.

### the agent's Discretion
- Exact cube dimensions, camera radius/height/FOV, damping factor, colors, and lighting rig. All of these live as named constants in one config file so they're easy to tune.
- HUD layout and micro-styling, as long as it matches the dark glass look.
- Labels above cubes (drei `<Html>`, no remote font fetch).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing frontend conventions
- `Frontend/package.json`: React 19, Vite 8, Tailwind v4, zustand 5 (versions constrain the R3F choice)
- `Frontend/src/App.tsx`: router; the only existing file that may change
- `Frontend/src/store/gameStore.ts`: zustand store pattern to copy
- `Frontend/src/pages/CoupGame.tsx`: header/pill styling reference (read-only, do NOT edit)
- `Frontend/src/hooks/usePlayerPosition.ts`: 2D seat layout reference (read-only, do NOT edit)

### Project planning
- `.planning/ROADMAP.md`: Phase 7 entry and the planned follow-up 3D phases
</canonical_refs>

<specifics>
## Specific Ideas
- The camera should feel like a modern "rotating turntable" around the table, following whoever's turn it is.
- Every future model must be very small. Phase 7 uses primitives only (zero downloaded bytes), which sets the baseline.
</specifics>

<deferred>
## Deferred Ideas (future phases, NOT Phase 7)
- Room GLB model, table GLB model, chair + person GLB models, card and coin GLB models (user will supply). Asset budget pipeline: `gltf-transform optimize` with meshopt/Draco compression, WebP/KTX2 textures, a per-model size budget, and `useGLTF` with the meshopt decoder.
- Binding seats and camera to real `gameState` (`turnIndex`, players, `isLocalPlayer`) from `useGameStore`.
- 2D/3D toggle inside `CoupGame` itself, sharing the same transport/store.
- 3D cards and coins, action animations, and the 3D-aware HUD (action console, modals, log over the canvas).
- Performance work: `frameloop="demand"`, instancing, adaptive DPR, mobile tuning.
</deferred>

---

*Phase: 07-3d-world-foundation*
*Context gathered: 2026-10-15 via inline brief (PRD express path)*
