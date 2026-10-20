import {
  CAMERA_HEIGHT,
  CAMERA_RADIUS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  SEAT_GAP,
  SEAT_SIZE,
  TABLE_CENTER,
  TABLE_HALF_SIZE,
} from '../config/sceneConfig';

type Vec3 = [number, number, number];

export interface SeatTransform {
  index: number;
  /** Azimuth around the table. 0 = +Z (front), increasing toward +X. */
  angle: number;
  position: Vec3;
  /** Y rotation so the seat's local +Z faces the table center. */
  rotationY: number;
}

export function clampPlayerCount(playerCount: number): number {
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Math.round(playerCount)));
}

/** Seats are evenly spaced; seat 0 sits at the front (+Z). */
export function getSeatAngle(index: number, playerCount: number): number {
  return (index * 2 * Math.PI) / clampPlayerCount(playerCount);
}

/**
 * Distance from the table center to the edge of the SQUARE table along the
 * direction at `angle`. A plain circle would push 45° seats into the corners.
 */
export function getTableEdgeDistance(angle: number): number {
  return TABLE_HALF_SIZE / Math.max(Math.abs(Math.sin(angle)), Math.abs(Math.cos(angle)));
}

export function getSeatTransforms(playerCount: number): SeatTransform[] {
  const count = clampPlayerCount(playerCount);
  return Array.from({ length: count }, (_, index) => {
    const angle = getSeatAngle(index, count);
    const radius = getTableEdgeDistance(angle) + SEAT_GAP;
    return {
      index,
      angle,
      position: [Math.sin(angle) * radius, SEAT_SIZE.height / 2, Math.cos(angle) * radius] as Vec3,
      rotationY: angle + Math.PI,
    };
  });
}

/** Camera sits behind/above the seat at `angle`, looking at the table center. */
export function getCameraPose(angle: number): { position: Vec3; target: Vec3 } {
  return {
    position: [Math.sin(angle) * CAMERA_RADIUS, CAMERA_HEIGHT, Math.cos(angle) * CAMERA_RADIUS],
    target: TABLE_CENTER,
  };
}

/** Signed shortest delta from `from` to `to`, wrapped to (-π, π]. */
export function shortestAngleDelta(from: number, to: number): number {
  const twoPi = 2 * Math.PI;
  let delta = (to - from) % twoPi;
  if (delta > Math.PI) delta -= twoPi;
  else if (delta <= -Math.PI) delta += twoPi;
  return delta;
}
