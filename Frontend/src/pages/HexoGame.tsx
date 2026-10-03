import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Import 3D Hex Tile Assets
import woodImg from '../../Hexo/3D Assets/3D/Wood.png';
import brickImg from '../../Hexo/3D Assets/3D/Brick.png';
import grainImg from '../../Hexo/3D Assets/3D/Grain.png';
import oreImg from '../../Hexo/3D Assets/3D/Ore.png';
import desertImg from '../../Hexo/3D Assets/3D/Desert.png';
import sheepImg from '../../Hexo/3D Assets/3D/Sheep.png';

// Import 3D Structures
import settlementImg from '../../Hexo/3D Assets/Settlements/Blue.png';
import roadImg from '../../Hexo/3D Assets/Roads/Blue Road.png';

interface HexTile {
  id: string;
  row: number;
  col: number;
  resource: 'wood' | 'sheep' | 'wheat' | 'brick' | 'ore' | 'desert';
  number: number;
  x: number;
  y: number;
}

interface Player {
  id: string;
  name: string;
  isYou: boolean;
  color: string;
  vp: number;
  settlementsCount: number;
  citiesCount: number;
  roadsCount: number;
  devCardsUsed: string[];
  devCardsHand: number;
  resources: {
    wood: number;
    brick: number;
    sheep: number;
    wheat: number;
    ore: number;
  };
}

interface BoardVertex {
  id: string;
  x: number;
  y: number;
  ownerId: string | null;
  type: 'settlement' | 'city' | null;
}

interface BoardEdge {
  id: string;
  v1: BoardVertex;
  v2: BoardVertex;
  ownerId: string | null;
}

interface LogEntry {
  time: string;
  message: string;
  type: 'system' | 'roll' | 'trade' | 'build' | 'card';
}

const RESOURCE_THEMES = {
  wood: { color: 'bg-emerald-700', gradient: 'from-emerald-600 to-emerald-800', border: 'border-emerald-600', name: 'Forest', emoji: '🌲', glow: 'glow-wood', image: woodImg },
  sheep: { color: 'bg-green-500', gradient: 'from-green-400 to-green-600', border: 'border-green-400', name: 'Pasture', emoji: '🐑', glow: 'glow-sheep', image: sheepImg },
  wheat: { color: 'bg-amber-500', gradient: 'from-amber-400 to-amber-600', border: 'border-amber-400', name: 'Wheat', emoji: '🌾', glow: 'glow-wheat', image: grainImg },
  brick: { color: 'bg-orange-600', gradient: 'from-orange-500 to-orange-750', border: 'border-orange-600', name: 'Clay Hills', emoji: '🧱', glow: 'glow-brick', image: brickImg },
  ore: { color: 'bg-slate-500', gradient: 'from-slate-400 to-slate-600', border: 'border-slate-400', name: 'Mountain', emoji: '🏔️', glow: 'glow-ore', image: oreImg },
  desert: { color: 'bg-yellow-600', gradient: 'from-yellow-500 to-yellow-700', border: 'border-yellow-650', name: 'Desert', emoji: '🏜️', glow: '', image: desertImg }
};

const WESTERN_NAMES = [
  'Wild_West_Steve',
  'Calamity_Jane',
  'Apache_Kid',
  'Billy_The_Kid',
  'Belle_Starr',
  'Doc_Holliday',
  'Jesse_James',
  'Butch_Cassidy',
  'Wyatt_Earp'
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const getPlayerFilter = (color: string) => {
  const c = color.toLowerCase();
  if (c === '#ef4444' || c === 'red') {
    return 'hue-rotate(140deg) saturate(1.5) brightness(0.9)';
  }
  if (c === '#f59e0b' || c === 'yellow' || c === '#f97316' || c === 'orange') {
    return 'hue-rotate(200deg) saturate(1.5) brightness(1.1)';
  }
  if (c === '#10b981' || c === 'green' || c === '#22c55e') {
    return 'hue-rotate(280deg) saturate(1.4) brightness(0.95)';
  }
  if (c === '#a855f7' || c === 'purple') {
    return 'hue-rotate(60deg) saturate(1.3)';
  }
  return 'none';
};

export default function HexoGame() {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userName = searchParams.get('name') || 'Sheriff_Joe';
  const initialPlayers = parseInt(searchParams.get('players') || '4');

  // React State for settings
  const [playersCount] = useState<number>(initialPlayers);
  const [mobileTab, setMobileTab] = useState<'board' | 'players' | 'trade' | 'logs'>('board');

  // Panning & Zooming
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const boardViewportRef = useRef<HTMLDivElement>(null);

  // Screen size check
  const [isDesktop, setIsDesktop] = useState<boolean>(window.innerWidth >= 1024);

  // Robber location
  const [robberHexId, setRobberHexId] = useState<string | null>(null);
  const [isMovingRobber, setIsMovingRobber] = useState(false);
  const [draggedDistance, setDraggedDistance] = useState(0);

  // Contextual menu overlay centered on a vertex or edge
  const [activeNodeMenu, setActiveNodeMenu] = useState<{
    type: 'vertex' | 'edge';
    id: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Wheel Zoom Listener
  useEffect(() => {
    const viewport = boardViewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      if (e.deltaY < 0) {
        setZoom(z => Math.min(3.0, z * zoomFactor));
      } else {
        setZoom(z => Math.max(0.5, z / zoomFactor));
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, []);

  // Game Grid States
  const [hexes, setHexes] = useState<HexTile[]>([]);
  const [vertices, setVertices] = useState<BoardVertex[]>([]);
  const [edges, setEdges] = useState<BoardEdge[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Dice States
  const [dice, setDice] = useState<[number, number]>([3, 4]);
  const [isRolling, setIsRolling] = useState(false);



  // Trading selections
  const [activeTradeCard, setActiveTradeCard] = useState<string | null>(null);
  const [tradeTargetRes, setTradeTargetRes] = useState<string>('brick');

  // AI popup
  const [activeTradeProposal, setActiveTradeProposal] = useState<{
    id: string;
    proposer: string;
    offer: { [key: string]: number };
    demand: { [key: string]: number };
    devOffer?: number;
    devDemand?: number;
  } | null>(null);

  const size = 52; // Hexagon radius
  const W = size * Math.sqrt(3);
  const H = size * 1.5;

  const viewBox = useMemo(() => {
    if (playersCount <= 4) return '-280 -270 560 540';
    if (playersCount <= 6) return '-360 -345 720 690';
    return '-430 -410 860 820';
  }, [playersCount]);

  // Dynamically calculate ocean circular board radius
  const boardCircleRadius = useMemo(() => {
    if (playersCount <= 4) return 270;
    if (playersCount <= 6) return 345;
    return 415;
  }, [playersCount]);

  const oceanHexPoints = useMemo(() => {
    const radius = boardCircleRadius;
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const px = radius * Math.cos(angle);
      const py = radius * Math.sin(angle);
      pts.push(`${px},${py}`);
    }
    return pts.join(' ');
  }, [boardCircleRadius]);

  const addLog = (message: string, type: LogEntry['type']) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ time, message, type }, ...prev]);
  };

  // Generate board grid and configurations
  useEffect(() => {
    const generatedPlayers: Player[] = [
      {
        id: 'you',
        name: `${userName} (You)`,
        isYou: true,
        color: '#ef4444',
        vp: 2,
        settlementsCount: 1,
        citiesCount: 0,
        roadsCount: 1,
        devCardsUsed: ['Knight'],
        devCardsHand: 1,
        resources: { wood: 4, brick: 2, sheep: 3, wheat: 5, ore: 2 }
      }
    ];

    const shuffledNames = shuffle(WESTERN_NAMES);
    for (let i = 1; i < playersCount; i++) {
      const colorOptions = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#14b8a6', '#ec4899', '#78350f'];
      generatedPlayers.push({
        id: `p-${i}`,
        name: shuffledNames[i - 1] || `Settler_${i}`,
        isYou: false,
        color: colorOptions[i - 1] || '#64748b',
        vp: 2,
        settlementsCount: 2,
        citiesCount: 0,
        roadsCount: 2,
        devCardsUsed: i % 2 === 0 ? ['Knight'] : [],
        devCardsHand: Math.floor(Math.random() * 2),
        resources: { wood: 2, brick: 1, sheep: 2, wheat: 3, ore: 1 }
      });
    }
    setPlayers(generatedPlayers);

    // Tiles
    let rowSizes: number[] = [];
    let resources: string[] = [];
    let numbers: number[] = [];

    if (playersCount <= 4) {
      rowSizes = [3, 4, 5, 4, 3];
      resources = shuffle([
        'wood', 'wood', 'wood', 'wood',
        'sheep', 'sheep', 'sheep', 'sheep',
        'wheat', 'wheat', 'wheat', 'wheat',
        'brick', 'brick', 'brick',
        'ore', 'ore', 'ore',
        'desert'
      ]);
      numbers = shuffle([2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]);
    } else if (playersCount <= 6) {
      rowSizes = [3, 4, 5, 6, 5, 4, 3];
      resources = shuffle([
        'wood', 'wood', 'wood', 'wood', 'wood', 'wood',
        'sheep', 'sheep', 'sheep', 'sheep', 'sheep', 'sheep',
        'wheat', 'wheat', 'wheat', 'wheat', 'wheat', 'wheat',
        'brick', 'brick', 'brick', 'brick', 'brick',
        'ore', 'ore', 'ore', 'ore', 'ore',
        'desert', 'desert'
      ]);
      numbers = shuffle([
        2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12
      ]);
    } else {
      rowSizes = [4, 5, 6, 7, 6, 5, 4];
      resources = shuffle([
        'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood', 'wood',
        'sheep', 'sheep', 'sheep', 'sheep', 'sheep', 'sheep', 'sheep', 'sheep',
        'wheat', 'wheat', 'wheat', 'wheat', 'wheat', 'wheat', 'wheat', 'wheat',
        'brick', 'brick', 'brick', 'brick', 'brick', 'brick',
        'ore', 'ore', 'ore', 'ore', 'ore', 'ore',
        'desert'
      ]);
      numbers = shuffle([
        2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 12, 12
      ]);
    }

    const generatedHexes: HexTile[] = [];
    let resIdx = 0;
    let numIdx = 0;
    const middleRow = Math.floor(rowSizes.length / 2);

    for (let r = 0; r < rowSizes.length; r++) {
      const N_r = rowSizes[r];
      for (let c = 0; c < N_r; c++) {
        const resource = resources[resIdx++] as HexTile['resource'];
        let num = 0;
        if (resource !== 'desert') {
          num = numbers[numIdx++];
        }

        const x = (c - (N_r - 1) / 2) * W;
        const y = (r - middleRow) * H;

        generatedHexes.push({
          id: `hex-${r}-${c}`,
          row: r,
          col: c,
          resource,
          number: num,
          x,
          y
        });
      }
    }
    setHexes(generatedHexes);

    // Initial robber position is the desert hex
    const desert = generatedHexes.find(h => h.resource === 'desert');
    if (desert) {
      setRobberHexId(desert.id);
    }

    // Vertices
    const generatedVerts: BoardVertex[] = [];
    generatedHexes.forEach(hex => {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30);
        const vx = hex.x + size * Math.cos(angle);
        const vy = hex.y + size * Math.sin(angle);

        let found = generatedVerts.find(v => Math.hypot(v.x - vx, v.y - vy) < 5);
        if (!found) {
          found = {
            id: `v-${generatedVerts.length}`,
            x: vx,
            y: vy,
            ownerId: null,
            type: null
          };
          generatedVerts.push(found);
        }
      }
    });

    // Edges
    const generatedEdges: BoardEdge[] = [];
    generatedHexes.forEach(hex => {
      const hexVerts: BoardVertex[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30);
        const vx = hex.x + size * Math.cos(angle);
        const vy = hex.y + size * Math.sin(angle);
        const found = generatedVerts.find(v => Math.hypot(v.x - vx, v.y - vy) < 5)!;
        hexVerts.push(found);
      }

      for (let i = 0; i < 6; i++) {
        const v1 = hexVerts[i];
        const v2 = hexVerts[(i + 1) % 6];

        const exists = generatedEdges.some(e =>
          (e.v1.id === v1.id && e.v2.id === v2.id) ||
          (e.v1.id === v2.id && e.v2.id === v1.id)
        );

        if (!exists) {
          generatedEdges.push({
            id: `e-${generatedEdges.length}`,
            v1,
            v2,
            ownerId: null
          });
        }
      }
    });

    // Pre-built settlement placements
    const you = generatedPlayers[0];
    const firstVert = generatedVerts.find(v => v.ownerId === null)!;
    firstVert.ownerId = you.id;
    firstVert.type = 'settlement';

    const connectedEdge = generatedEdges.find(e => (e.v1.id === firstVert.id || e.v2.id === firstVert.id) && e.ownerId === null)!;
    connectedEdge.ownerId = you.id;

    generatedPlayers.slice(1).forEach((p) => {
      const getAdj = (vertex: BoardVertex) => {
        const adj: BoardVertex[] = [];
        generatedEdges.forEach(e => {
          if (e.v1.id === vertex.id) adj.push(e.v2);
          else if (e.v2.id === vertex.id) adj.push(e.v1);
        });
        return adj;
      };

      const isValidSett = (vertex: BoardVertex) => {
        if (vertex.ownerId !== null) return false;
        const adj = getAdj(vertex);
        return adj.every(v => v.ownerId === null);
      };

      const availableVerts = shuffle([...generatedVerts]);
      let settlementsBuilt = 0;

      for (const v of availableVerts) {
        if (settlementsBuilt >= 2) break;
        if (isValidSett(v)) {
          v.ownerId = p.id;
          v.type = settlementsBuilt === 0 ? 'settlement' : 'city';
          settlementsBuilt++;

          let roadsBuilt = 0;
          const connected = shuffle(generatedEdges.filter(e => e.v1.id === v.id || e.v2.id === v.id));
          for (const edge of connected) {
            if (roadsBuilt >= 1) break;
            if (edge.ownerId === null) {
              edge.ownerId = p.id;
              roadsBuilt++;
            }
          }
        }
      }
    });

    setVertices(generatedVerts);
    setEdges(generatedEdges);
    setLogs([]);
    addLog(`Match started! Lobby Room: ${lobbyCode || 'HEX-TEMP'}`, 'system');
    addLog(`Kingdom Board created: ${playersCount} Players Board (${hexes.length || rowSizes.reduce((a, b) => a + b, 0)} hexes)`, 'system');
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setActiveNodeMenu(null);
  }, [playersCount]);

  // Ports
  const portsList = useMemo(() => {
    const numPorts = playersCount <= 4 ? 9 : playersCount <= 6 ? 11 : 14;
    const portRadius = playersCount <= 4 ? 220 : playersCount <= 6 ? 295 : 365;
    const types = ['3:1', 'wood', 'sheep', '3:1', 'wheat', 'brick', '3:1', 'ore', 'wood', 'sheep', '3:1', 'wheat', 'brick', 'ore'];

    const results = [];
    for (let i = 0; i < numPorts; i++) {
      const angle = (i * 2 * Math.PI) / numPorts - Math.PI / 2;
      const x = portRadius * Math.cos(angle);
      const y = portRadius * Math.sin(angle);

      let nearestHex = hexes[0];
      let minDist = Infinity;
      hexes.forEach(h => {
        const d = Math.hypot(h.x - x, h.y - y);
        if (d < minDist) {
          minDist = d;
          nearestHex = h;
        }
      });

      results.push({
        id: `port-${i}`,
        x,
        y,
        type: types[i % types.length],
        hexX: nearestHex?.x || 0,
        hexY: nearestHex?.y || 0
      });
    }
    return results;
  }, [hexes, playersCount]);

  // BRACKET PORT DOCK LINES MATHEMATICS: connects to the exact 2 closest land vertices on nearest hex
  const portBracketLines = useMemo(() => {
    return portsList.map(port => {
      const hexVertices = vertices.filter(v => Math.hypot(v.x - port.hexX, v.y - port.hexY) < size + 5);
      const sorted = [...hexVertices].sort((a, b) => 
        Math.hypot(a.x - port.x, a.y - port.y) - Math.hypot(b.x - port.x, b.y - port.y)
      );
      
      const v1 = sorted[0];
      const v2 = sorted[1];
      
      return {
        id: `dock-lines-${port.id}`,
        px: port.x,
        py: port.y,
        v1x: v1 ? v1.x : port.hexX,
        v1y: v1 ? v1.y : port.hexY,
        v2x: v2 ? v2.x : port.hexX,
        v2y: v2 ? v2.y : port.hexY
      };
    });
  }, [portsList, vertices]);

  // Dice roll
  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    addLog(`${players[0].name} is casting the dice...`, 'system');

    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDice([Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]);
      rollCount++;
      if (rollCount > 10) {
        clearInterval(rollInterval);
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2;
        setDice([d1, d2]);
        setIsRolling(false);
        addLog(`${players[0].name} rolled: ${total} (${d1} + ${d2})`, 'roll');

        // Distribution logic
        const payouts: string[] = [];
        players.forEach(p => {
          let earnings: { [key: string]: number } = { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };
          let earnedTotal = 0;

          hexes.forEach(h => {
            if (h.number === total && h.resource !== 'desert') {
              const hexVertices = vertices.filter(v => Math.hypot(v.x - h.x, v.y - h.y) < size + 5);
              hexVertices.forEach(v => {
                if (v.ownerId === p.id) {
                  const amt = v.type === 'city' ? 2 : 1;
                  earnings[h.resource] += amt;
                  earnedTotal += amt;
                }
              });
            }
          });

          if (earnedTotal > 0) {
            Object.keys(earnings).forEach(res => {
              const key = res as 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore';
              if (earnings[key] > 0) {
                p.resources[key] += Math.max(0, earnings[key]);
              }
            });
            const earnedStr = Object.entries(earnings)
              .filter(([_, v]) => v > 0)
              .map(([k, v]) => `+${v} ${RESOURCE_THEMES[k as keyof typeof RESOURCE_THEMES].emoji} ${k}`)
              .join(', ');
            payouts.push(`${p.name} harvested: ${earnedStr}`);
          }
        });

        if (payouts.length > 0) {
          payouts.forEach(txt => addLog(txt, 'system'));
          setPlayers([...players]);
        } else {
          addLog('No fields harvested this turn.', 'system');
        }

        // AI Proposal trigger
        if (Math.random() > 0.4) {
          setTimeout(() => {
            const aiPlayer = players.find(p => !p.isYou);
            if (aiPlayer) {
              const offerRes = shuffle(['wood', 'sheep', 'wheat'])[0] as string;
              const demandRes = shuffle(['brick', 'ore'])[0] as string;
              setActiveTradeProposal({
                id: `trade-${Date.now()}`,
                proposer: aiPlayer.name,
                offer: { [offerRes]: 1 },
                demand: { [demandRes]: 1 }
              });
            }
          }, 3000);
        }
      }
    }, 80);
  };

  // Map contextual menu build triggers
  const buildSettlementDirectly = (vertexId: string) => {
    const vertex = vertices.find(v => v.id === vertexId);
    if (!vertex) return;

    const wood = players[0].resources.wood;
    const brick = players[0].resources.brick;
    const sheep = players[0].resources.sheep;
    const wheat = players[0].resources.wheat;

    if (wood < 1 || brick < 1 || sheep < 1 || wheat < 1) {
      alert('Insufficient resources! Requires: 1 Wood, 1 Brick, 1 Sheep, 1 Wheat');
      return;
    }

    players[0].resources.wood -= 1;
    players[0].resources.brick -= 1;
    players[0].resources.sheep -= 1;
    players[0].resources.wheat -= 1;

    vertex.ownerId = 'you';
    vertex.type = 'settlement';
    players[0].vp += 1;
    players[0].settlementsCount += 1;
    setPlayers([...players]);
    setVertices([...vertices]);
    addLog(`${userName} built a Settlement! (+1 VP)`, 'build');
    setActiveNodeMenu(null);
  };

  const buildCityDirectly = (vertexId: string) => {
    const vertex = vertices.find(v => v.id === vertexId);
    if (!vertex || vertex.ownerId !== 'you' || vertex.type !== 'settlement') return;

    const wheat = players[0].resources.wheat;
    const ore = players[0].resources.ore;

    if (wheat < 2 || ore < 3) {
      alert('Insufficient resources! Requires: 2 Wheat, 3 Ore');
      return;
    }

    players[0].resources.wheat -= 2;
    players[0].resources.ore -= 3;

    vertex.type = 'city';
    players[0].vp += 1;
    players[0].settlementsCount -= 1;
    players[0].citiesCount += 1;
    setPlayers([...players]);
    setVertices([...vertices]);
    addLog(`${userName} built a City! (+1 VP)`, 'build');
    setActiveNodeMenu(null);
  };

  const buildRoadDirectly = (edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;

    const wood = players[0].resources.wood;
    const brick = players[0].resources.brick;

    if (wood < 1 || brick < 1) {
      alert('Insufficient resources! Requires: 1 Wood, 1 Brick');
      return;
    }

    players[0].resources.wood -= 1;
    players[0].resources.brick -= 1;

    edge.ownerId = 'you';
    players[0].roadsCount += 1;
    setPlayers([...players]);
    setEdges([...edges]);
    addLog(`${userName} placed a Road!`, 'build');
    setActiveNodeMenu(null);
  };

  const getAdjacent = (vertex: BoardVertex) => {
    const adj: BoardVertex[] = [];
    edges.forEach(e => {
      if (e.v1.id === vertex.id) adj.push(e.v2);
      else if (e.v2.id === vertex.id) adj.push(e.v1);
    });
    return adj;
  };

  const getValidSettlementNodes = () => {
    return vertices.filter(v => {
      if (v.ownerId !== null) return false;
      const adj = getAdjacent(v);
      return adj.every(adjV => adjV.ownerId === null);
    });
  };

  const getValidRoadEdges = () => {
    return edges.filter(e => {
      if (e.ownerId !== null) return false;
      const connectsToBuilding = (e.v1.ownerId === 'you') || (e.v2.ownerId === 'you');
      const connectsToRoad = edges.some(otherEdge =>
        otherEdge.ownerId === 'you' &&
        otherEdge.id !== e.id &&
        (otherEdge.v1.id === e.v1.id || otherEdge.v2.id === e.v1.id || otherEdge.v1.id === e.v2.id || otherEdge.v2.id === e.v2.id)
      );
      return connectsToBuilding || connectsToRoad;
    });
  };

  const buyDevCard = () => {
    const sheep = players[0].resources.sheep;
    const wheat = players[0].resources.wheat;
    const ore = players[0].resources.ore;

    if (sheep < 1 || wheat < 1 || ore < 1) {
      alert('Requires: 1 Sheep, 1 Wheat, 1 Ore');
      return;
    }

    players[0].resources.sheep -= 1;
    players[0].resources.wheat -= 1;
    players[0].resources.ore -= 1;

    const cardsPool = ['Knight', 'Road Building', 'Year of Plenty', 'Monopoly', 'Victory Point'];
    const rolledCard = cardsPool[Math.floor(Math.random() * cardsPool.length)];

    players[0].devCardsUsed.push(rolledCard);
    if (rolledCard === 'Victory Point') {
      players[0].vp += 1;
      addLog(`${userName} bought a Dev Card: ${rolledCard}! (+1 VP)`, 'card');
    } else {
      addLog(`${userName} bought a Dev Card: ${rolledCard}!`, 'card');
    }
    setPlayers([...players]);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.cursor-pointer') || target.tagName === 'button' || target.tagName === 'select') {
      return;
    }
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setDraggedDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    const newPanX = e.clientX - panStart.x;
    const newPanY = e.clientY - panStart.y;
    const dx = newPanX - pan.x;
    const dy = newPanY - pan.y;
    setDraggedDistance(prev => prev + Math.hypot(dx, dy));
    setPan({ x: newPanX, y: newPanY });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      const touch = e.touches[0];
      setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newPanX = touch.clientX - panStart.x;
    const newPanY = touch.clientY - panStart.y;
    setPan({ x: newPanX, y: newPanY });
  };

  const handleZoomIn = () => setZoom(z => Math.min(3.0, z * 1.2));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z / 1.2));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setActiveNodeMenu(null);
  };



  const handleAcceptAIProposal = () => {
    if (!activeTradeProposal) return;

    const proposal = activeTradeProposal;
    let canTrade = true;

    Object.keys(proposal.demand).forEach(res => {
      const key = res as keyof typeof players[0]['resources'];
      if (players[0].resources[key] < proposal.demand[res]) {
        canTrade = false;
      }
    });

    if (!canTrade) {
      alert(`Insufficient cards to trade!`);
      return;
    }

    const targetAI = players.find(p => p.name === proposal.proposer);
    if (targetAI) {
      Object.keys(proposal.demand).forEach(res => {
        const key = res as keyof typeof players[0]['resources'];
        players[0].resources[key] -= proposal.demand[res];
        targetAI.resources[key] += proposal.demand[res];
      });

      Object.keys(proposal.offer).forEach(res => {
        const key = res as keyof typeof players[0]['resources'];
        players[0].resources[key] += proposal.offer[res];
        targetAI.resources[key] -= proposal.offer[res];
      });

      setPlayers([...players]);
      const offerStr = Object.entries(proposal.offer).filter(([_, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ');
      const demandStr = Object.entries(proposal.demand).filter(([_, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ');
      addLog(`Trade completed! ${players[0].name} traded with ${proposal.proposer}. Exchanged [ ${demandStr} ] for [ ${offerStr} ]`, 'trade');
    }

    setActiveTradeProposal(null);
  };

  // Node buildable lists
  const validSettlements = getValidSettlementNodes();
  const validRoads = getValidRoadEdges();
  const validCities = vertices.filter(v => v.ownerId === 'you' && v.type === 'settlement');

  // Trigger contextual node overlays
  const triggerVertexClick = (vertex: BoardVertex) => {
    if (draggedDistance > 8) return;
    const isSettlementValid = validSettlements.some(vs => vs.id === vertex.id);
    const isCityValid = validCities.some(vc => vc.id === vertex.id);

    if (isSettlementValid || isCityValid) {
      setActiveNodeMenu({
        type: 'vertex',
        id: vertex.id,
        x: vertex.x,
        y: vertex.y
      });
    } else {
      setActiveNodeMenu(null);
    }
  };

  const triggerEdgeClick = (edge: BoardEdge) => {
    if (draggedDistance > 8) return;
    const isRoadValid = validRoads.some(vr => vr.id === edge.id);
    if (isRoadValid) {
      const midX = (edge.v1.x + edge.v2.x) / 2;
      const midY = (edge.v1.y + edge.v2.y) / 2;
      setActiveNodeMenu({
        type: 'edge',
        id: edge.id,
        x: midX,
        y: midY
      });
    } else {
      setActiveNodeMenu(null);
    }
  };

  // Robber pawn click relocation
  const handleHexClick = (hex: HexTile) => {
    if (draggedDistance > 8) return;
    if (isMovingRobber) {
      setRobberHexId(hex.id);
      addLog(`Robber moved to hex ${hex.number || 'Desert'}`, 'system');
      setIsMovingRobber(false);
    }
  };

  const getLogStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'build':
        return { bg: 'bg-indigo-955/35 border-indigo-900/35 text-indigo-200', icon: '🔨' };
      case 'trade':
        return { bg: 'bg-emerald-955/35 border-emerald-900/35 text-emerald-200', icon: '🤝' };
      case 'roll':
        return { bg: 'bg-amber-955/35 border-amber-900/35 text-amber-200', icon: '🎲' };
      case 'card':
        return { bg: 'bg-purple-955/35 border-purple-900/35 text-purple-200', icon: '🃏' };
      default:
        return { bg: 'bg-slate-900/35 border-slate-800/35 text-slate-300', icon: '📢' };
    }
  };

  return (
    <div className="theme-hexo min-h-screen h-screen w-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#020617_80%)] text-[#f1f5f9] flex flex-col overflow-hidden font-sans select-none relative">
      
      {/* HEADER BAR */}
      <header className="h-16 border-b border-slate-800 bg-[#0c1220]/90 px-6 flex justify-between items-center w-full shrink-0 z-20 shadow-md">
        {/* Left logo & game mode pill */}
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black text-[#d4af37] tracking-widest cursor-default font-medieval">HEXO</span>
          <div className="flex items-center gap-1.5 bg-[#070b13] border border-slate-800 px-3 py-1 rounded-xl text-[10px] font-black uppercase text-[#d4af37] shadow-inner select-none">
            <span>⚙️</span>
            <span>{playersCount} Player Game</span>
          </div>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/hexo')} className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-red-955/40 border border-slate-800 hover:border-red-900/60 text-xs font-bold text-slate-300 transition-colors cursor-pointer" title="Exit Match">
            Leave Game
          </button>
        </div>
      </header>

      {/* MOBILE TAB TABS INSTEAD OF DESKTOP PANELS */}
      {!isDesktop && (
        <div className="flex border-b border-slate-800 bg-[#0c1220]/90 text-xs font-black shrink-0 z-25 w-full">
          {['board', 'players', 'trade', 'logs'].map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab as any)}
              className={`flex-1 py-3 text-center border-b-2 transition-all uppercase font-medieval ${
                mobileTab === tab ? 'border-[#d4af37] text-[#d4af37] bg-slate-900/30' : 'border-transparent text-slate-400'
              }`}
            >
              {tab === 'board' ? '🗺️ Board' : tab === 'players' ? '👥 Players' : tab === 'trade' ? '🤝 Trade' : '📜 logs'}
            </button>
          ))}
        </div>
      )}

      {/* MAIN SCREEN SPLIT CONTENT */}
      <div className="flex-grow flex flex-row overflow-hidden w-full relative">
        
        {/* LEFT COLUMN: Players List (Circle Avatars and Turn Order Indicators) */}
        <aside className={`${
          isDesktop ? 'w-64 flex' : mobileTab === 'players' ? 'w-full flex h-full' : 'hidden'
        } shrink-0 bg-[#0a0f1d]/90 border-r border-slate-800 flex-col overflow-hidden relative shadow-md`}>
          <div className="flex flex-col h-full overflow-hidden w-full">
            
            <div className="p-3 border-b border-slate-800 bg-slate-900/10 shrink-0">
              <h2 className="text-[10px] font-black tracking-widest text-[#d4af37] font-medieval uppercase">
                👑 SETTLERS LEDGER
              </h2>
            </div>

            {/* Players cards list */}
            <div className="p-3 space-y-3 overflow-y-auto flex-grow w-full">
              {players.map((p, idx) => {
                const isCurrentTurn = idx === 0;
                return (
                  <div 
                    key={p.id}
                    className={`p-3 rounded-xl border bg-[#0c1220]/95 relative overflow-hidden flex flex-col transition-all ${
                      isCurrentTurn 
                        ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-amber-500/5' 
                        : 'border-slate-800 shadow-sm opacity-75 hover:opacity-90'
                    }`}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: p.color }} />

                    <div className="flex items-center gap-3">
                      {/* Avatar Circle */}
                      <div className="relative shrink-0 select-none">
                        <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-xs font-black shadow-inner overflow-hidden text-slate-200">
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                        {/* Number Index */}
                        <span 
                          style={{ backgroundColor: p.color }}
                          className="absolute -top-1 -left-1 w-4 h-4 rounded-full text-[8px] font-black text-white flex items-center justify-center border border-slate-900 shadow-md"
                        >
                          {idx + 1}
                        </span>
                      </div>

                      {/* Info & VP / Card Hand stats */}
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[13px] truncate text-slate-100 font-medieval">{p.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isCurrentTurn && (
                              <span className="text-[7.5px] bg-[#d4af37] text-slate-950 font-black px-1.5 py-0.2 rounded uppercase animate-pulse leading-none font-medieval">
                                Active
                              </span>
                            )}
                            <span className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-amber-500 font-black tracking-wider leading-none shadow font-medieval">
                              {p.vp} VP
                            </span>
                          </div>
                        </div>
                        
                        {/* Summary Stats Grid */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] font-bold text-slate-400">
                          <span className="flex items-center gap-1">🎴 {p.resources.wood + p.resources.brick + p.resources.sheep + p.resources.wheat + p.resources.ore} Cards</span>
                          <span className="flex items-center gap-1">🏠 {p.settlementsCount} Set.</span>
                          <span className="flex items-center gap-1">🏰 {p.citiesCount} Cities</span>
                          <span className="flex items-center gap-1">➖ {p.roadsCount} Roads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* MIDDLE SECTION: Circular Board Canvas & Resource Toolbar */}
        <main className={`flex-grow flex-col justify-between overflow-hidden relative ${
          isDesktop ? 'flex h-full' : mobileTab === 'board' ? 'flex h-full w-full' : 'hidden'
        }`}>

          {/* Ocean Board game canvas (Constant Zoomable & Slidable - Starry table background) */}
          <div 
            ref={boardViewportRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUpOrLeave}
            onClick={() => setActiveNodeMenu(null)}
            className="flex-grow relative flex items-center justify-center bg-[#070b13] bg-[radial-gradient(circle_at_center,_#111827_0%,_#030712_100%)] overflow-hidden shadow-inner w-full cursor-grab active:cursor-grabbing select-none"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.015)_0%,_transparent_100%)] pointer-events-none" />

            {/* Robber movement banner overlay */}
            {isMovingRobber && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-950/95 border border-[#d4af37] text-slate-100 px-4 py-2 rounded-xl shadow-lg z-50 text-[11px] font-black uppercase tracking-wider animate-bounce select-none pointer-events-none flex items-center gap-2">
                <span>♟ Relocating Robber... Click any hex to place!</span>
              </div>
            )}

            {/* Panning & Zoom button widget controls */}
            <div className="absolute top-3 right-3 flex flex-col gap-1 z-10 shrink-0 select-none">
              <button 
                onClick={handleZoomIn}
                className="w-7 h-7 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg shadow-md flex items-center justify-center font-bold text-sm text-[#d4af37] active:scale-95 transition-all cursor-pointer"
              >
                +
              </button>
              <button 
                onClick={handleZoomOut}
                className="w-7 h-7 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg shadow-md flex items-center justify-center font-bold text-sm text-[#d4af37] active:scale-95 transition-all cursor-pointer"
              >
                -
              </button>
              <button 
                onClick={handleResetZoom}
                className="w-7 h-7 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg shadow-md flex items-center justify-center font-bold text-xs text-[#d4af37] active:scale-95 transition-all cursor-pointer"
              >
                ↺
              </button>
            </div>

            {/* SVG Canvas Map */}
            <div 
              className="w-full h-full flex items-center justify-center p-2 pointer-events-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center',
                transition: isPanning ? 'none' : 'transform 0.15s ease-out'
              }}
            >
              <svg 
                viewBox={viewBox} 
                className="w-full h-full max-w-full max-h-full drop-shadow-2xl pointer-events-auto" 
                style={{ overflow: 'visible' }}
              >
                <defs>
                  {/* Gradients */}
                  {Object.entries(RESOURCE_THEMES).map(([key]) => (
                    <linearGradient id={`grad-${key}`} x1="0.2" y1="0" x2="0.8" y2="1" key={key}>
                      <stop offset="0%" stopColor={key === 'desert' ? '#fed7aa' : key === 'wood' ? '#22c55e' : key === 'sheep' ? '#86efac' : key === 'wheat' ? '#fde047' : key === 'brick' ? '#f97316' : '#cbd5e1'} />
                      <stop offset="100%" stopColor={key === 'desert' ? '#d97706' : key === 'wood' ? '#15803d' : key === 'sheep' ? '#166534' : key === 'wheat' ? '#ca8a04' : key === 'brick' ? '#b91c1c' : '#64748b'} />
                    </linearGradient>
                  ))}

                  {/* Circular Ocean Water Gradient fill */}
                  <radialGradient id="ocean-water" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="70%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </radialGradient>
                  
                  {/* Hexagon Clip Path centered at (0, 0) */}
                  <clipPath id="hex-clip">
                    <polygon points={
                      (() => {
                        const pts = [];
                        for (let i = 0; i < 6; i++) {
                          const angle = (Math.PI / 180) * (60 * i - 30);
                          const px = size * Math.cos(angle);
                          const py = size * Math.sin(angle);
                          pts.push(`${px},${py}`);
                        }
                        return pts.join(' ');
                      })()
                    } />
                  </clipPath>
                </defs>

                {/* Hexagonal Ocean Water backdrop */}
                <polygon
                  points={oceanHexPoints}
                  fill="url(#ocean-water)"
                  stroke="#0f172a"
                  strokeWidth="3"
                  className="drop-shadow-2xl"
                />

                {/* CIRCULAR WOOD-BOARD GAME TABLE CONTAINER FRAME */}
                <circle
                  cx="0"
                  cy="0"
                  r={boardCircleRadius + 8}
                  fill="#181512"
                  stroke="#d4af37"
                  strokeWidth="6"
                  className="drop-shadow-2xl"
                />

                {/* Ocean Water Circle inside the table */}
                <circle
                  cx="0"
                  cy="0"
                  r={boardCircleRadius}
                  fill="url(#ocean-water)"
                  stroke="#080d16"
                  strokeWidth="1"
                />

                {/* DRAW PORT HARBOR BRIDGES */}
                {portBracketLines.map((lines) => (
                  <g key={`docks-${lines.id}`} opacity="0.85">
                    <line 
                      x1={lines.px} 
                      y1={lines.py} 
                      x2={lines.v1x} 
                      y2={lines.v1y} 
                      stroke="#854d0e" 
                      strokeWidth="4.5" 
                      strokeLinecap="round"
                    />
                    <line 
                      x1={lines.px} 
                      y1={lines.py} 
                      x2={lines.v1x} 
                      y2={lines.v1y} 
                      stroke="#d4af37" 
                      strokeWidth="1.2" 
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </g>
                ))}

                {/* DRAW HEX TILES (Floating deep blue ocean shadows and oak bevels) */}
                {hexes.map((hex) => {
                  const theme = RESOURCE_THEMES[hex.resource];
                  
                  const getHexPoints = (radius: number, offsetX = 0, offsetY = 0) => {
                    const pts = [];
                    for (let i = 0; i < 6; i++) {
                      const angle = (Math.PI / 180) * (60 * i - 30);
                      const px = hex.x + offsetX + radius * Math.cos(angle);
                      const py = hex.y + offsetY + radius * Math.sin(angle);
                      pts.push(`${px},${py}`);
                    }
                    return pts.join(' ');
                  };

                  const shadowPoints = getHexPoints(size, 2, 5);
                  const outerPoints = getHexPoints(size);
                  const innerPoints = getHexPoints(size - 4.5);

                  const isNumberRed = hex.number === 6 || hex.number === 8;

                  const getDots = (num: number) => {
                    if (num === 2 || num === 12) return '.';
                    if (num === 3 || num === 11) return '..';
                    if (num === 4 || num === 10) return '...';
                    if (num === 5 || num === 9) return '....';
                    if (num === 6 || num === 8) return '.....';
                    return '';
                  };

                  const isRolledMatch = !isRolling && (dice[0] + dice[1]) === hex.number && hex.number > 0;

                  return (
                    <g key={hex.id} className="group" onClick={(e) => { e.stopPropagation(); handleHexClick(hex); }}>
                      {/* Constant Floating Shadow Polygon (Azure-blue shadow matches clear sunlit ocean water) */}
                      <polygon
                        points={shadowPoints}
                        fill="#020617"
                        opacity="0.4"
                      />

                      {/* Outer Oak Bevel Rim */}
                      <polygon
                        points={outerPoints}
                        fill="#5c3e21"
                        stroke="#d4af37"
                        strokeWidth="1.5"
                      />

                      {/* Rolled Glow Ring */}
                      {isRolledMatch && (
                        <polygon
                          points={outerPoints}
                          fill="none"
                          stroke="#d4af37"
                          strokeWidth="10"
                          opacity="0.85"
                          className="animate-pulse"
                        />
                      )}

                      {/* Inner Rich Gradient Polygon (Acts as backdrop and interaction trigger) */}
                      <polygon
                        points={innerPoints}
                        fill={`url(#grad-${hex.resource})`}
                        stroke="#221105"
                        strokeWidth="1.5"
                        className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                      />

                      {/* 3D Image Asset cropped inside the hexagon */}
                      {theme.image && (
                        <g transform={`translate(${hex.x}, ${hex.y})`} className="pointer-events-none">
                          <image
                            href={theme.image}
                            x={-size}
                            y={-size}
                            width={size * 2}
                            height={size * 2}
                            clipPath="url(#hex-clip)"
                            className="pointer-events-none"
                          />
                        </g>
                      )}

                      {/* Bevel highlights for depth */}
                      <polygon
                        points={innerPoints}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="0.5"
                        opacity="0.2"
                        pointerEvents="none"
                      />

                      {/* Number Token parchment circle */}
                      {hex.number > 0 && (
                        <g>
                          <circle
                            cx={hex.x}
                            cy={hex.y}
                            r="17"
                            fill="#fffdf5"
                            stroke="#b45309"
                            strokeWidth="1.5"
                            className="drop-shadow"
                          />
                          
                          <text
                            x={hex.x}
                            y={hex.y - 3}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={isNumberRed ? '#b91c1c' : '#3e2612'}
                            className="font-black text-[13px] font-sans select-none pointer-events-none"
                          >
                            {hex.number}
                          </text>

                          <text
                            x={hex.x}
                            y={hex.y + 6}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={isNumberRed ? '#b91c1c' : '#b45309'}
                            className="text-[10px] font-bold tracking-widest select-none pointer-events-none"
                          >
                            {getDots(hex.number)}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* CENTER ROBBER PAWN DRAWING (Pawn shape centered on active robber hex) */}
                {robberHexId && (
                  (() => {
                    const robHex = hexes.find(h => h.id === robberHexId);
                    if (!robHex) return null;
                    return (
                      <g transform={`translate(${robHex.x}, ${robHex.y - 12})`} className="drop-shadow-2xl pointer-events-none z-30 select-none">
                        {/* Shadow ellipse under pawn */}
                        <ellipse cx="0" cy="18" rx="8" ry="3" fill="#000" opacity="0.45" />
                        {/* Robber Pawn Silhouette */}
                        <path 
                          d="M -7,15 C -7,15 -9,15 -9,17.5 C -9,19 9,19 9,17.5 C 9,15 7,15 7,15 L 4.5,4 C 6.5,2 6.5,-1.5 0,-1.5 C -6.5,-1.5 -6.5,2 -4.5,4 Z" 
                          fill="#0f172a" 
                          stroke="#64748b" 
                          strokeWidth="1.5" 
                        />
                        <circle cx="0" cy="-3" r="5" fill="#334155" stroke="#64748b" strokeWidth="1" />
                      </g>
                    );
                  })()
                )}

                {/* DRAW SHIPS / PORTS COVERS */}
                {portsList.map((port) => (
                  <g key={port.id} className="cursor-pointer group">
                    <circle
                      cx={port.x}
                      cy={port.y}
                      r="14"
                      fill="#0f172a"
                      stroke="#d4af37"
                      strokeWidth="2.5"
                      className="drop-shadow-md group-hover:scale-110 transition-transform duration-200"
                    />
                    <text
                      x={port.x}
                      y={port.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="font-black text-[9px] fill-[#d4af37] uppercase font-medieval"
                    >
                      {port.type === '3:1' ? '3:1' : RESOURCE_THEMES[port.type as keyof typeof RESOURCE_THEMES]?.emoji}
                    </text>
                  </g>
                ))}

                {/* DRAW ROAD EDGES - 3D Blocks */}
                {edges.map((edge) => {
                  const owner = players.find(p => p.id === edge.ownerId);
                  const isValidRoad = validRoads.some(vr => vr.id === edge.id);

                  // Calculate rotation angle and midpoint
                  const midX = (edge.v1.x + edge.v2.x) / 2;
                  const midY = (edge.v1.y + edge.v2.y) / 2;
                  const angleRad = Math.atan2(edge.v2.y - edge.v1.y, edge.v2.x - edge.v1.x);
                  const angleDeg = (angleRad * 180) / Math.PI;

                  return (
                    <g key={edge.id} onClick={(e) => { e.stopPropagation(); triggerEdgeClick(edge); }}>
                      {edge.ownerId && owner && (
                        <g transform={`translate(${midX}, ${midY}) rotate(${angleDeg})`}>
                          {/* Shadow */}
                          <rect x={-14} y={-2} width={28} height={5} fill="#020617" opacity="0.35" rx="1" />
                          {/* Road 3D asset image */}
                          <image
                            href={roadImg}
                            x={-16}
                            y={-4.5}
                            width="32"
                            height="9"
                            style={{ filter: getPlayerFilter(owner.color) }}
                          />
                        </g>
                      )}

                      {/* Subtle yellow/gold road placement dashes (Clickable indicator) */}
                      {isValidRoad && (
                        <line
                          x1={edge.v1.x}
                          y1={edge.v1.y}
                          x2={edge.v2.x}
                          y2={edge.v2.y}
                          stroke="#d4af37"
                          strokeWidth="8"
                          strokeDasharray="2 3"
                          opacity="0.5"
                          className="cursor-pointer hover:stroke-yellow-400 hover:opacity-100 transition-all animate-pulse"
                        />
                      )}
                    </g>
                  );
                })}

                {/* DRAW VERTICES - 3D Isometric Buildings */}
                {vertices.map((v) => {
                  const owner = players.find(p => p.id === v.ownerId);
                  const isSettlementValid = validSettlements.some(vs => vs.id === v.id);
                  const isCityValid = validCities.some(vc => vc.id === v.id);

                  return (
                    <g key={v.id} onClick={(e) => { e.stopPropagation(); triggerVertexClick(v); }}>
                      {v.ownerId && owner && (
                        <g className="cursor-pointer">
                          {v.type === 'settlement' ? (
                            <g>
                              {/* 3D Shadow under settlement */}
                              <ellipse cx={v.x} cy={v.y + 5} rx="9" ry="4.5" fill="#020617" opacity="0.4" />
                              {/* 3D image asset (Larger, unfiltered) */}
                              <image
                                href={settlementImg}
                                x={v.x - 14}
                                y={v.y - 19}
                                width="28"
                                height="28"
                              />
                            </g>
                          ) : (
                            <g>
                              {/* 3D Shadow under double city house */}
                              <ellipse cx={v.x} cy={v.y + 6} rx="11" ry="5.5" fill="#020617" opacity="0.4" />
                              {/* House 1 (offset back left) */}
                              <image
                                href={settlementImg}
                                x={v.x - 17}
                                y={v.y - 21}
                                width="25"
                                height="25"
                                style={{ opacity: 0.85 }}
                              />
                              {/* House 2 (offset front right) */}
                              <image
                                href={settlementImg}
                                x={v.x - 8}
                                y={v.y - 15}
                                width="25"
                                height="25"
                              />
                            </g>
                          )}
                        </g>
                      )}

                      {/* Subtle yellow vertex dot (settlement build indicator) */}
                      {isSettlementValid && (
                        <circle
                          cx={v.x}
                          cy={v.y}
                          r="5.5"
                          fill="#d4af37"
                          stroke="#fffdfa"
                          strokeWidth="1.2"
                          opacity="0.6"
                          className="hover:scale-125 transition-transform hover:opacity-100 cursor-pointer"
                        />
                      )}

                      {/* City Upgrade overlay */}
                      {isCityValid && (
                        <circle
                          cx={v.x}
                          cy={v.y}
                          r="9"
                          fill="none"
                          stroke="#d4af37"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                          opacity="0.75"
                          className="cursor-pointer hover:scale-110 animate-spin"
                        />
                      )}
                    </g>
                  );
                })}

                {/* CONTEXTUAL BUBBLE ACTIONS POPUP OVERLAY */}
                {activeNodeMenu && (
                  (() => {
                    if (activeNodeMenu.type === 'vertex') {
                      const isSettlementValid = validSettlements.some(vs => vs.id === activeNodeMenu.id);
                      const isCityValid = validCities.some(vc => vc.id === activeNodeMenu.id);
                      
                      return (
                        <g transform={`translate(${activeNodeMenu.x}, ${activeNodeMenu.y})`} className="z-50 select-none">
                          {/* Anchor bubble pointer background */}
                          <path 
                            d="M-30,-34 L30,-34 L30,-12 L4,-12 L0,-8 L-4,-12 L-30,-12 Z" 
                            fill="#0c1220" 
                            stroke="#d4af37" 
                            strokeWidth="1.8" 
                            className="drop-shadow-lg" 
                          />
                          
                          {/* Settlement action button */}
                          {isSettlementValid && (
                            <g transform="translate(-15, -23)" className="cursor-pointer hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); buildSettlementDirectly(activeNodeMenu.id); }}>
                              <circle r="8.5" fill="#10b981" stroke="#fff" strokeWidth="0.8" />
                              <text textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="8" fontWeight="bold" y="-0.5">🏠</text>
                            </g>
                          )}

                          {/* City Upgrade action button */}
                          {isCityValid && (
                            <g transform="translate(15, -23)" className="cursor-pointer hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); buildCityDirectly(activeNodeMenu.id); }}>
                              <circle r="8.5" fill="#3b82f6" stroke="#fff" strokeWidth="0.8" />
                              <text textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="8" fontWeight="bold" y="-0.5">🏰</text>
                            </g>
                          )}

                          {/* Close Cross button */}
                          <g 
                            transform={`translate(${(!isSettlementValid || !isCityValid) ? '0' : '0'}, -23)`} 
                            className="cursor-pointer hover:scale-110 transition-transform" 
                            onClick={(e) => { e.stopPropagation(); setActiveNodeMenu(null); }}
                          >
                            <circle r="5.5" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
                            <text textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="7" fontWeight="black" y="-0.5">×</text>
                          </g>
                        </g>
                      );
                    } else {
                      // Edge Context menu (Road placement)
                      return (
                        <g transform={`translate(${activeNodeMenu.x}, ${activeNodeMenu.y})`} className="z-50 select-none">
                          <path 
                            d="M-22,-32 L22,-32 L22,-12 L4,-12 L0,-8 L-4,-12 L-22,-12 Z" 
                            fill="#0c1220" 
                            stroke="#d4af37" 
                            strokeWidth="1.8" 
                            className="drop-shadow-lg" 
                          />
                          
                          {/* Build Road option */}
                          <g transform="translate(-8, -22)" className="cursor-pointer hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); buildRoadDirectly(activeNodeMenu.id); }}>
                            <circle r="8.5" fill="#f59e0b" stroke="#fff" strokeWidth="0.8" />
                            <text textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="9" fontWeight="bold" y="-0.5">➖</text>
                          </g>

                          {/* Close cross */}
                          <g transform="translate(10, -22)" className="cursor-pointer hover:scale-110 transition-transform" onClick={(e) => { e.stopPropagation(); setActiveNodeMenu(null); }}>
                            <circle r="5.5" fill="#ef4444" stroke="#fff" strokeWidth="0.5" />
                            <text textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="7" fontWeight="black" y="-0.5">×</text>
                          </g>
                        </g>
                      );
                    }
                  })()
                )}

              </svg>
            </div>

            {/* DYNAMIC PLAYER TRADE POPUPS FOR AI PROPOSALS */}
            <AnimatePresence>
              {activeTradeProposal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 50 }}
                  className="absolute bottom-24 left-4 right-4 max-w-sm mx-auto bg-[#0a0f1d] border-2 border-b-4 border-[#d4af37] rounded-2xl p-4 shadow-xl z-40 text-xs font-bold text-slate-100"
                >
                  <div className="text-center font-medieval border-b border-[#d4af37]/20 pb-2 mb-2 text-[#d4af37] tracking-widest">
                    👑 ROYAL DECREE: INCOMING TRADE
                  </div>
                  <div className="mb-3 text-center">
                    <span className="text-[#d4af37] font-bold">{activeTradeProposal.proposer}</span> proposes:
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-[#070b13] border border-slate-800 p-2.5 rounded-xl text-[11px] mb-3">
                    <div>
                      <span className="text-emerald-500 block text-[9px] uppercase tracking-wide">You Receive:</span>
                      {Object.entries(activeTradeProposal.offer).map(([k, v]) => (
                        <span key={k} className="block">{v} {RESOURCE_THEMES[k as keyof typeof RESOURCE_THEMES].emoji} {RESOURCE_THEMES[k as keyof typeof RESOURCE_THEMES].name}</span>
                      ))}
                    </div>
                    <div className="border-l border-slate-800 pl-2.5">
                      <span className="text-red-500 block text-[9px] uppercase tracking-wide">You Give:</span>
                      {Object.entries(activeTradeProposal.demand).map(([k, v]) => (
                        <span key={k} className="block">{v} {RESOURCE_THEMES[k as keyof typeof RESOURCE_THEMES].emoji} {RESOURCE_THEMES[k as keyof typeof RESOURCE_THEMES].name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptAIProposal()}
                      className="flex-1 py-2 bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white font-bold rounded-lg border-b-2 border-blue-900 active:translate-y-0.5 uppercase transition-all shadow text-center text-[10px] cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setActiveTradeProposal(null)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border-b-2 border-slate-900 active:translate-y-0.5 uppercase transition-all text-center text-[10px] cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* DOCK BAR SECTION (Dice Block on Left, Treasury resources in Middle) */}
          <footer className="bg-[#0c1220]/95 border-t border-slate-850 p-4 shrink-0 z-10 w-full shadow-md">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Bottom Left: Dice Block */}
              <div className="bg-[#070b13]/90 border border-slate-800 p-3 rounded-2xl shadow-inner flex items-center gap-3 shrink-0 select-none">
                <div className="flex gap-2">
                  {[dice[0], dice[1]].map((val, idx) => (
                    <motion.div
                      key={idx}
                      animate={isRolling ? { rotate: [0, 90, 180, 270, 360], y: [0, -12, 6, 0] } : {}}
                      transition={{ duration: 0.15, repeat: isRolling ? Infinity : 0 }}
                      className="w-12 h-12 bg-[#fdfbf7] border-2 border-b-4 border-amber-900 rounded-xl shadow flex items-center justify-center font-black text-xl text-[#3e2612] font-serif relative"
                    >
                      {val}
                      <div className="absolute inset-0.5 border border-black/5 rounded pointer-events-none" />
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5 shrink-0 select-none">
                  <button
                    onClick={rollDice}
                    disabled={isRolling}
                    className={`px-4 py-2 bg-[#b91c1c] hover:bg-[#991b1b] text-white border-b-4 border-[#7f1d1d] active:translate-y-[2px] active:border-b-2 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                      isRolling ? 'opacity-50 cursor-not-allowed border-b-0 translate-y-0.5 shadow-none' : ''
                    }`}
                  >
                    <span>🎲 Cast Dice</span>
                  </button>
                  <button 
                    onClick={() => setIsMovingRobber(!isMovingRobber)}
                    className={`w-full py-1 bg-slate-900 hover:bg-slate-800 text-amber-500 hover:text-amber-400 border border-slate-800 rounded text-[8.5px] font-bold uppercase transition-all cursor-pointer`}
                  >
                    {isMovingRobber ? 'Cancel Robber' : '♟ Move Robber'}
                  </button>
                </div>
              </div>

              {/* Bottom Center: Player's Resource Treasury Deck */}
              <div className="flex-grow bg-[#070b13]/90 border border-slate-800 p-3 rounded-2xl shadow-inner flex items-center justify-between select-none max-w-2xl w-full">
                <div className="flex flex-col w-full h-full justify-between">
                  <span className="text-[9.5px] font-black tracking-widest text-[#d4af37] font-medieval uppercase border-b border-slate-800/40 pb-1 mb-1.5 block shrink-0">
                    🏛️ YOUR TREASURY DECK
                  </span>
                  
                  <div className="flex justify-around items-center flex-grow">
                    {[
                      { key: 'wood', emoji: '🪵', label: 'Wood', count: players[0]?.resources.wood },
                      { key: 'brick', emoji: '🧱', label: 'Brick', count: players[0]?.resources.brick },
                      { key: 'sheep', emoji: '🐑', label: 'Sheep', count: players[0]?.resources.sheep },
                      { key: 'wheat', emoji: '🌾', label: 'Wheat', count: players[0]?.resources.wheat },
                      { key: 'ore', emoji: '🏔️', label: 'Ore', count: players[0]?.resources.ore }
                    ].map(({ key, emoji, label, count }) => (
                      <div 
                        key={key} 
                        onClick={() => {
                          setActiveTradeCard(key);
                          const defaultTarget = ['wood', 'brick', 'sheep', 'wheat', 'ore'].find(r => r !== key) || 'brick';
                          setTradeTargetRes(defaultTarget);
                        }}
                        className="flex flex-col items-center select-none cursor-pointer hover:scale-110 active:scale-95 transition-all"
                        title={`Click to trade your ${label}`}
                      >
                        <span className="text-2xl filter drop-shadow">{emoji}</span>
                        <span className="text-[8px] font-black text-slate-400 mt-0.5 uppercase tracking-wider">{label}</span>
                        <span className="text-base font-black text-[#d4af37] mt-0.5 leading-none">{count}</span>
                      </div>
                    ))}

                    {/* Development Book Cards */}
                    <div className="border-l border-slate-800 pl-4 flex flex-col items-center">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Dev Cards</span>
                      <div 
                        onClick={buyDevCard}
                        className="w-8 h-10 bg-amber-900/10 border border-amber-500/20 rounded-lg flex items-center justify-center shadow-inner relative text-base cursor-pointer hover:border-[#d4af37] transition-all hover:scale-105 active:scale-95"
                        title="Click to buy Development Card"
                      >
                        📔
                        <span className="absolute -top-1.5 -right-1.5 bg-[#b45309] text-[8px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center border border-slate-900 shadow">
                          {players[0]?.devCardsHand}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Contextual Trade Modal (Moved to the Left) */}
              <AnimatePresence>
                {activeTradeCard && (
                  <motion.div 
                    initial={{ opacity: 0, y: 35, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 25, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute bottom-28 left-4 md:left-6 bg-[#0c1220]/98 border border-[#d4af37]/65 p-4 rounded-2xl w-[360px] md:w-[400px] shadow-2xl z-40 select-none text-slate-100 font-sans"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                      <span className="font-bold text-xs uppercase tracking-wider text-[#d4af37] font-medieval flex items-center gap-1">
                        🤝 Trade {RESOURCE_THEMES[activeTradeCard as keyof typeof RESOURCE_THEMES].emoji} {activeTradeCard.toUpperCase()}
                      </span>
                      <button 
                        onClick={() => setActiveTradeCard(null)}
                        className="text-slate-400 hover:text-slate-200 text-xs font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-pointer transition-all"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Choose Card to receive */}
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 font-medieval">1. Choose card to get:</span>
                        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-850">
                          {['wood', 'brick', 'sheep', 'wheat', 'ore'].map(res => {
                            if (res === activeTradeCard) return null;
                            return (
                              <button
                                key={res}
                                onClick={() => setTradeTargetRes(res)}
                                className={`h-11 rounded-lg border flex flex-col items-center justify-around cursor-pointer transition-all ${
                                  tradeTargetRes === res 
                                    ? 'border-[#d4af37] bg-[#d4af37]/10 text-white font-black' 
                                    : 'border-slate-850 bg-slate-900 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <span className="text-lg">{RESOURCE_THEMES[res as keyof typeof RESOURCE_THEMES].emoji}</span>
                                <span className="text-[7.5px] uppercase font-bold leading-none font-sans">{res}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Direct Actions: Send to Bank / Send to Friends */}
                      <div className="grid grid-cols-2 gap-3.5 pt-1">
                        
                        {/* Send to Bank (4:1) */}
                        <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl flex flex-col justify-between h-full text-center">
                          <div>
                            <span className="block font-black text-slate-300 text-[10px] uppercase tracking-wider mb-1 font-medieval">🏦 Send to Bank</span>
                            <p className="text-[9px] text-slate-500 leading-normal font-sans">Exchanges 4 matching cards to get 1 chosen card.</p>
                          </div>

                          <button
                            disabled={players[0].resources[activeTradeCard as keyof typeof players[0]['resources']] < 4}
                            onClick={() => {
                              const resKey = activeTradeCard as keyof typeof players[0]['resources'];
                              const tarKey = tradeTargetRes as keyof typeof players[0]['resources'];
                              players[0].resources[resKey] -= 4;
                              players[0].resources[tarKey] += 1;
                              setPlayers([...players]);
                              addLog(`${players[0].name} completed Maritime Trade: Exchanged 4 ${activeTradeCard} for 1 ${tradeTargetRes} with the Bank.`, 'trade');
                              setActiveTradeCard(null);
                            }}
                            className={`w-full mt-3 py-2 text-white font-bold text-[9px] rounded-lg border-b-2 uppercase tracking-widest transition-all cursor-pointer font-medieval ${
                              players[0].resources[activeTradeCard as keyof typeof players[0]['resources']] >= 4
                                ? 'bg-amber-700 hover:bg-amber-600 border-amber-900 active:translate-y-0.5'
                                : 'bg-slate-900 border-slate-950 text-slate-600 cursor-not-allowed border-b-0'
                            }`}
                          >
                            Send to Bank
                          </button>
                        </div>

                        {/* Send to Friends */}
                        <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl flex flex-col justify-between h-full text-center">
                          <div>
                            <span className="block font-black text-slate-300 text-[10px] uppercase tracking-wider mb-1 font-medieval">🤠 Send to Friends</span>
                            <p className="text-[9px] text-slate-500 leading-normal font-sans">Propose 1:1 trade card proposal to settlers.</p>
                          </div>

                          <button
                            disabled={players[0].resources[activeTradeCard as keyof typeof players[0]['resources']] < 1}
                            onClick={() => {
                              const demandObj = { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };
                              const offerObj = { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };
                              offerObj[activeTradeCard as keyof typeof offerObj] = 1;
                              demandObj[tradeTargetRes as keyof typeof demandObj] = 1;

                              addLog(`${players[0].name} proposed trade to friends: Offered 1 ${activeTradeCard} for 1 ${tradeTargetRes}`, 'trade');
                              setActiveTradeCard(null);

                              setTimeout(() => {
                                setActiveTradeProposal({
                                  id: `proposal-accept`,
                                  proposer: players[1].name,
                                  offer: demandObj,
                                  demand: offerObj
                                });
                              }, 2000);
                            }}
                            className={`w-full mt-3 py-2 text-white font-bold text-[9px] rounded-lg border-b-2 uppercase tracking-widest transition-all cursor-pointer font-medieval ${
                              players[0].resources[activeTradeCard as keyof typeof players[0]['resources']] >= 1
                                ? 'bg-[#1e3a8a] hover:bg-[#1d4ed8] border-blue-900 active:translate-y-0.5'
                                : 'bg-slate-900 border-slate-950 text-slate-600 cursor-not-allowed border-b-0'
                            }`}
                          >
                            Send to Friends
                          </button>
                        </div>

                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </footer>

        </main>

        {/* RIGHT COLUMN: Game Logs (Stretches to 100% height) */}
        <section className={`${
          isDesktop ? 'w-[340px] flex h-full flex-col' : (mobileTab === 'logs') ? 'w-full flex h-full' : 'hidden'
        } shrink-0 border-l border-slate-800 bg-[#0a0f1d]/90 flex-col overflow-hidden`}>
          
          <div className="flex-grow flex flex-col p-3 h-full overflow-hidden">
            {/* Game Logs Container */}
            <div className="border border-slate-800 bg-[#0c1220]/95 p-4 rounded-xl shadow-md flex-grow flex flex-col overflow-hidden h-full">
              <h4 className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest border-b border-slate-850 pb-1.5 mb-2 font-medieval shrink-0">
                Game Log
              </h4>
              <div className="flex-grow overflow-y-auto space-y-2 pr-1 font-sans text-[10px] leading-relaxed text-slate-300">
                {logs.length === 0 ? (
                  <div className="text-center text-slate-600 py-10 font-bold uppercase tracking-widest select-none animate-pulse">
                    No events recorded.
                  </div>
                ) : (
                  logs.map((log, idx) => {
                    const style = getLogStyle(log.type);
                    return (
                      <div 
                        key={idx} 
                        className={`px-3 py-2 rounded-xl border leading-relaxed flex items-start gap-2.5 transition-all shadow-sm ${style.bg}`}
                      >
                        <span className="text-sm shrink-0 select-none">{style.icon}</span>
                        <span className="flex-grow select-text">{log.message}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </section>

      </div>

    </div>
  );
}
