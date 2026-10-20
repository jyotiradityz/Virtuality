/**
 * Phase 7 scene constants. World units = Blender units, Y-up.
 *
 * The table corners were authored in Blender (Z-up) as (±16, ±16, 16).
 * In Three.js (Y-up) that is a horizontal tabletop at y = 16 spanning
 * x, z ∈ [-16, 16].
 */

export const TABLE_HALF_SIZE = 16;
export const TABLE_TOP_Y = 16;
export const TABLE_THICKNESS = 1;
/** Camera look-at target: the middle of the tabletop. */
export const TABLE_CENTER: [number, number, number] = [0, TABLE_TOP_Y, 0];

/** Distance from the table edge to the seat center. */
export const SEAT_GAP = 7;
/** Placeholder cube (chair + body). Bottom sits on the floor (y = 0). */
export const SEAT_SIZE = { width: 8, height: 28, depth: 8 };

export const CAMERA_RADIUS = 60;
export const CAMERA_HEIGHT = 52;
export const CAMERA_FOV = 45;
/** Exponential damping rate (1/s). Higher = snappier glide. */
export const CAMERA_DAMPING = 4;

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export const COLORS = {
  background: '#07080d',
  floor: '#10121b',
  table: '#3b2a1e',
  tablePedestal: '#2a1d14',
  seat: '#3a4258',
  activeSeat: '#e0a93b',
  activeSeatEmissive: '#a86f12',
  frontMarker: '#c9ced9',
} as const;
