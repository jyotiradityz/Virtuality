import type { Player } from '../types/game';

export interface Position {
  x: number;
  y: number;
}

// Seat positions for OPPONENTS around the top & sides of the table
const OPPONENT_COORDINATES: Record<number, Position> = {
  0: { x: -340, y: -20 },   // Left
  1: { x: -200, y: -180 },  // Top Left
  2: { x: 0, y: -200 },     // Top Center
  3: { x: 200, y: -180 },   // Top Right
  4: { x: 340, y: -20 },    // Right
};

export function calculatePlayerPositions(players: Player[]): (Player & { position: Position })[] {
  const total = players.length;
  if (total === 0) return [];

  const opponents = players.filter((p) => !p.isLocalPlayer);
  const oppCount = opponents.length;

  let oppPositions: Position[] = [];

  if (oppCount === 1) {
    oppPositions = [OPPONENT_COORDINATES[2]];
  } else if (oppCount === 2) {
    oppPositions = [OPPONENT_COORDINATES[1], OPPONENT_COORDINATES[3]];
  } else if (oppCount === 3) {
    oppPositions = [OPPONENT_COORDINATES[0], OPPONENT_COORDINATES[2], OPPONENT_COORDINATES[4]];
  } else if (oppCount === 4) {
    oppPositions = [OPPONENT_COORDINATES[0], OPPONENT_COORDINATES[1], OPPONENT_COORDINATES[3], OPPONENT_COORDINATES[4]];
  } else {
    oppPositions = [OPPONENT_COORDINATES[0], OPPONENT_COORDINATES[1], OPPONENT_COORDINATES[2], OPPONENT_COORDINATES[3], OPPONENT_COORDINATES[4]];
  }

  return players.map((player) => {
    if (player.isLocalPlayer) {
      return {
        ...player,
        position: { x: 0, y: 0 },
      };
    }

    const oppIdx = opponents.findIndex((o) => o.id === player.id);
    const pos = oppPositions[oppIdx] || { x: 0, y: -180 };
    return {
      ...player,
      position: pos,
    };
  });
}
