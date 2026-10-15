import type { Player } from '../types/game';

export interface Position {
  x: number; // Percentage offset from center (-50 to +50)
  y: number; // Percentage offset from center (-50 to +50)
}

// Seat positions for OPPONENTS placed on the SIDES & PERIMETER of the board (NOT inside the table)
// Directly matching Image 2 where each player seat is an extruded cream podium docked around the wooden rim:
const OPPONENT_COORDINATES: Record<number, Position[]> = {
  // 1 opponent (heads up): Top center side
  1: [{ x: 0, y: -62 }],
  // 2 opponents: Top-left and Top-right sides
  2: [
    { x: -30, y: -60 },
    { x: 30, y: -60 },
  ],
  // 3 opponents: Far-left wing, Top center side, Far-right wing
  3: [
    { x: -55, y: -20 }, // Left wing
    { x: 0, y: -62 },   // Top center side
    { x: 55, y: -20 },  // Right wing
  ],
  // 4 opponents: Far-left wing, Top-left side, Top-right side, Far-right wing
  4: [
    { x: -55, y: -20 }, // Far-left wing
    { x: -28, y: -60 }, // Top-left side
    { x: 28, y: -60 },  // Top-right side
    { x: 55, y: -20 },  // Far-right wing
  ],
  // 5 opponents (6 players match - standard Coup max):
  5: [
    { x: -55, y: -20 }, // Far-left wing (elevated above action tray, like Sophie in Image 2)
    { x: -28, y: -60 }, // Top-left side (like Liam in Image 2)
    { x: 0, y: -62 },   // Top-center side (like Chloe in Image 2)
    { x: 28, y: -60 },  // Top-right side (like Ben in Image 2)
    { x: 55, y: -20 },  // Far-right wing (elevated above action tray, like Noah in Image 2)
  ],
};

export function calculatePlayerPositions(players: Player[]): (Player & { position: Position })[] {
  const total = players.length;
  if (total === 0) return [];

  const opponents = players.filter((p) => !p.isLocalPlayer);
  const oppCount = Math.min(opponents.length, 5);
  const oppPositions = OPPONENT_COORDINATES[oppCount] || OPPONENT_COORDINATES[3];

  return players.map((player) => {
    if (player.isLocalPlayer) {
      return {
        ...player,
        position: { x: 0, y: 0 },
      };
    }

    const oppIdx = opponents.findIndex((o) => o.id === player.id);
    const pos = oppPositions[oppIdx] || { x: 0, y: -32 };
    return {
      ...player,
      position: pos,
    };
  });
}
