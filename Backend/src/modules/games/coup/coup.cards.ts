import { CoupCard, CoupRole } from './coup.types.js';

export function createDeck(): CoupCard[] {
  const roles: CoupRole[] = ['DUKE', 'ASSASSIN', 'CAPTAIN', 'AMBASSADOR', 'CONTESSA'];
  const deck: CoupCard[] = [];

  let count = 1;
  for (const role of roles) {
    for (let i = 0; i < 3; i++) {
      deck.push({
        id: `card_${role.toLowerCase()}_${count++}`,
        role,
        status: 'ALIVE',
      });
    }
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(deck: CoupCard[]): CoupCard[] {
  const shuffled = [...deck];
  // Unbiased Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}

export function dealInitialCards(
  deck: CoupCard[],
  playerCount: number
): { dealt: Record<number, CoupCard[]>; remainingDeck: CoupCard[] } {
  const remaining = [...deck];
  const dealt: Record<number, CoupCard[]> = {};

  for (let p = 0; p < playerCount; p++) {
    dealt[p] = [remaining.pop()!, remaining.pop()!];
  }

  return { dealt, remainingDeck: remaining };
}
