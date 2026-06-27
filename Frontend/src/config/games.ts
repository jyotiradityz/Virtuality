export interface GameConfig {
  id: string;
  name: string;
  path: string;
  description: string;
  themeClass: string;
  accentColor: string;
  tagline: string;
  minPlayers: number;
  maxPlayers: number;
}

export const GAMES: GameConfig[] = [
  {
    id: 'hexo',
    name: 'Hexo',
    path: '/hexo',
    description: 'A modern, strategic multiplayer board game of resource management, trading, and tactical expansion. Build settlements, roads, and cities to dominate the island.',
    themeClass: 'theme-hexo',
    accentColor: 'from-orange-500 to-amber-500',
    tagline: 'Trade, Build, Settle',
    minPlayers: 2,
    maxPlayers: 8,
  },
  {
    id: 'mafia',
    name: 'Mafia',
    path: '/mafia',
    description: 'A thrilling game of social deduction, secret roles, and betrayal. Uncover the mafia members before they eliminate the townspeople.',
    themeClass: 'theme-mafia',
    accentColor: 'from-red-600 to-neutral-900',
    tagline: 'Trust No One',
    minPlayers: 5,
    maxPlayers: 20,
  }
];
