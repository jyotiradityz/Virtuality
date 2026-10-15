import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { GameTable } from '../components/table/GameTable';
import { LocalPlayerConsole } from '../components/panels/LocalPlayerConsole';
import { GameLog } from '../components/panels/GameLog';
import { CoupLobby } from '../components/lobby/CoupLobby';
import { useGameStore } from '../store/gameStore';
import { useGame } from '../hooks/useGame';
import type { GameAction, Role, RoomInfo } from '../types/game';
import { ChallengeModal } from '../components/modals/ChallengeModal';
import { BlockModal } from '../components/modals/BlockModal';
import { LoseInfluenceModal } from '../components/modals/LoseInfluenceModal';
import { ExchangeModal } from '../components/modals/ExchangeModal';
import { BLOCK_ROLES, ROLE_CLAIMS } from '../game/rules';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketTransport } from '../api/socketTransport';
import { CoupSwordsIcon, DukeIcon } from '../components/shared/CoupIcons';
import '../styles/coup.css';

export const CoupGame: React.FC = () => {
  const navigate = useNavigate();
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const [searchParams] = useSearchParams();
  const queryName = searchParams.get('name') || '';
  const queryMode = searchParams.get('mode');
  const queryBots = parseInt(searchParams.get('bots') || '3');

  const initialGameMode = queryMode === 'singleplayer' ? 'MOCK' : 'SOCKET';
  const shouldSkipLobby = Boolean(lobbyCode || queryMode === 'singleplayer');

  const [inLobby, setInLobby] = useState(!shouldSkipLobby);
  const [gameMode, setGameMode] = useState<'MOCK' | 'SOCKET'>(initialGameMode);
  const [botCount, setBotCount] = useState(queryBots);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const { transport } = useGame(gameMode, botCount);
  const gameState = useGameStore((state) => state.gameState);

  useEffect(() => {
    if (gameMode === 'SOCKET' && lobbyCode && transport instanceof SocketTransport) {
      transport.reconnectMatch(lobbyCode, queryName || 'Guest Player').catch((e) => {
        console.error('Failed to attach match:', e);
      });
    }
  }, [lobbyCode, queryName, gameMode, transport]);

  const localPlayer = gameState?.players.find((p) => p.isLocalPlayer);

  const handleStartSinglePlayer = (_name: string, count: number) => {
    setBotCount(count);
    setGameMode('MOCK');
    setInLobby(false);
  };

  const handleCreateRoom = async (name: string) => {
    setGameMode('SOCKET');
    if (transport instanceof SocketTransport) {
      try {
        const info = await transport.createRoom(name);
        setRoomInfo(info);
      } catch (e) {
        console.error('Failed to create room', e);
      }
    }
  };

  const handleJoinRoom = async (code: string, name: string) => {
    setGameMode('SOCKET');
    if (transport instanceof SocketTransport) {
      try {
        const info = await transport.joinRoom(code, name);
        setRoomInfo(info);
      } catch (e) {
        console.error('Failed to join room', e);
      }
    }
  };

  const handleStartMultiplayerGame = async () => {
    if (transport instanceof SocketTransport) {
      await transport.startGame();
      setInLobby(false);
    }
  };

  const handlePerformAction = (action: GameAction) => {
    transport.sendAction(action);
  };

  const handlePass = () => {
    transport.sendPass();
  };

  const handleBlock = (claimedRole: Role) => {
    if (localPlayer) {
      transport.sendBlock(localPlayer.id, claimedRole);
    }
  };

  const handleChallenge = () => {
    if (localPlayer) {
      transport.sendChallenge(localPlayer.id);
    }
  };

  const handleLoseInfluenceConfirm = (cardId: string) => {
    if (localPlayer) {
      transport.sendLoseInfluence(localPlayer.id, cardId);
    }
  };

  const handleExchangeConfirm = (keptCardIds: string[]) => {
    transport.sendExchange(keptCardIds);
  };

  if (!gameState) {
    if (inLobby) {
      if (roomInfo) {
        return (
          <div className="boardgame-room w-full h-screen flex items-center justify-center p-4">
            <div className="coup-modal-panel p-8 max-w-md w-full space-y-5 text-center">
              <h2 className="text-amber-400 text-2xl font-black tracking-widest uppercase font-coup">
                CHAMBER: {roomInfo.roomCode}
              </h2>
              <div className="glass-inset p-4 rounded-2xl space-y-2">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  CONNECTED NOBLES ({roomInfo.players.length}/6)
                </p>
                {roomInfo.players.map((p) => (
                  <div key={p.id} className="flex justify-between items-center text-sm font-bold text-white">
                    <span>{p.name} {p.isHost && '(Host)'}</span>
                    <span className="text-xs text-emerald-400 font-bold">READY</span>
                  </div>
                ))}
              </div>

              {roomInfo.hostId ? (
                <button
                  onClick={handleStartMultiplayerGame}
                  className="glass-btn-primary w-full py-3.5 font-black text-xs tracking-wider uppercase font-coup cursor-pointer"
                >
                  Start Match Now
                </button>
              ) : (
                <p className="text-slate-400 text-xs font-bold animate-pulse">
                  Waiting for host to launch court match...
                </p>
              )}
            </div>
          </div>
        );
      }

      return (
        <CoupLobby
          onStartSinglePlayer={handleStartSinglePlayer}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      );
    }

    return (
      <div className="coup-cream-room w-full h-screen flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl neu-flat flex items-center justify-center text-amber-600 mb-4 animate-pulse">
          <CoupSwordsIcon className="w-7 h-7" />
        </div>
        <h2 className="text-stone-900 font-black text-xl tracking-wider uppercase text-center">
          CONNECTING TO MATCH {lobbyCode ? `[${lobbyCode}]` : ''}...
        </h2>
        <p className="text-stone-500 text-xs font-semibold mt-2">
          Dealing cards & coins...
        </p>
      </div>
    );
  }

  // Modals derivation
  const pendingAction = gameState?.pendingAction;
  const pendingLoseInfluence = gameState?.pendingLoseInfluence;
  const pendingExchange = gameState?.pendingExchange;

  const showLoseInfluenceModal =
    gameState?.phase === 'LOSE_INFLUENCE_PENDING' &&
    pendingLoseInfluence?.playerId === localPlayer?.id;

  const showExchangeModal =
    gameState?.phase === 'EXCHANGE_PENDING' &&
    pendingExchange?.playerId === localPlayer?.id;

  let showChallengeModal = false;
  let showBlockModal = false;
  let responseActorName = '';
  let responseActionName = '';
  let responseClaimedRole: Role = 'Duke';
  let availableBlockRoles: Role[] = [];
  let canChallenge = false;

  if (localPlayer && localPlayer.isAlive && pendingAction) {
    const isActor = pendingAction.sourcePlayerId === localPlayer.id;
    const actorPlayer = gameState?.players.find((p) => p.id === pendingAction.sourcePlayerId);
    responseActorName = actorPlayer?.name || 'Player';
    responseActionName = pendingAction.action.type;

    if (gameState?.phase === 'RESPONSE_WINDOW') {
      if (!isActor) {
        const actionType = pendingAction.action.type;
        const blockRoles = BLOCK_ROLES[actionType] || [];
        const actionClaimedRole = ROLE_CLAIMS[actionType];

        if (blockRoles.length > 0) {
          showBlockModal = true;
          availableBlockRoles = blockRoles;
          canChallenge = !!actionClaimedRole;
        } else if (actionClaimedRole) {
          showChallengeModal = true;
          responseClaimedRole = actionClaimedRole;
        }
      }
    } else if (gameState?.phase === 'BLOCK_RESPONSE_WINDOW' && pendingAction.block) {
      const isBlocker = pendingAction.block.blockerPlayerId === localPlayer.id;
      if (!isBlocker) {
        const blockerPlayer = gameState?.players.find(
          (p) => p.id === pendingAction.block?.blockerPlayerId
        );
        responseActorName = blockerPlayer?.name || 'Blocker';
        responseClaimedRole = pendingAction.block.claimedRole;
        responseActionName = `Block (${pendingAction.action.type})`;
        showChallengeModal = true;
      }
    }
  }

  const activeTurnPlayer = gameState?.players[gameState?.turnIndex || 0];

  return (
    <div className="coup-cream-room relative w-full h-screen overflow-hidden flex flex-col justify-between">
      
      {/* ─── TOP BAR: BRAND LOGO, TURN BANNER & CONTROLS ─── */}
      <header className="w-full px-4 sm:px-6 py-3 flex items-center justify-between z-30 shrink-0">
        {/* Left: Coup Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl neu-flat flex items-center justify-center text-amber-600 shadow-sm">
            <CoupSwordsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-lg text-stone-900 tracking-wider uppercase leading-none">
              COUP
            </h1>
            <span className="text-[9px] font-extrabold text-stone-500 uppercase tracking-widest block mt-0.5">
              TABLETOP
            </span>
          </div>
        </div>

        {/* Center: Current Turn Pill (Matching Image 2) */}
        <div className="neu-flat px-4 py-1.5 rounded-full flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <span className="text-stone-800 font-extrabold text-xs sm:text-sm tracking-wide">
            {gameState?.phase === 'GAME_OVER'
              ? 'VICTORY DECIDED'
              : activeTurnPlayer?.isLocalPlayer
              ? 'YOUR TURN'
              : `CURRENT PLAYER: ${activeTurnPlayer?.name}`}
          </span>
          {gameState && gameState.phase !== 'GAME_OVER' && (
            <span className="px-2 py-0.5 rounded-md neu-inset-sm text-[10px] font-black text-stone-600">
              R{gameState.turnIndex + 1}
            </span>
          )}
        </div>

        {/* Right: Chamber Code & Leave */}
        <div className="flex items-center gap-2.5">
          {lobbyCode && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-inset-sm text-xs font-mono font-black text-stone-700">
              <span className="text-stone-400 text-[10px] uppercase font-sans">Room:</span>
              <span>{lobbyCode}</span>
            </div>
          )}
          <button
            onClick={() => navigate('/coup')}
            className="neu-btn px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-stone-700 hover:text-stone-900 transition-all cursor-pointer"
          >
            Leave
          </button>
        </div>
      </header>

      {/* ─── MAIN ARENA: THE GRAND RACETRACK OVAL TABLE ─── */}
      <main className="flex-grow w-full h-[calc(100vh-210px)] relative overflow-visible flex items-center justify-center">
        <GameTable
          selectedCardId={selectedCardId}
          onCardSelect={(cardId) => setSelectedCardId(cardId === selectedCardId ? null : cardId)}
        />
      </main>

      {/* ─── FLOATING COURT LOG DRAWER (Bottom-Left) ─── */}
      <GameLog entries={gameState?.gameLog || []} />

      {/* ─── LOCAL PLAYER CONSOLE & HAND DOCK (Bottom) ─── */}
      {localPlayer && (
        <LocalPlayerConsole
          player={localPlayer}
          selectedCardId={selectedCardId}
          onCardSelect={(cardId) => setSelectedCardId(cardId === selectedCardId ? null : cardId)}
          onPerformAction={handlePerformAction}
        />
      )}

      {/* ─── INTERACTIVE MODALS ─── */}
      <AnimatePresence>
        {showChallengeModal && (
          <ChallengeModal
            actorName={responseActorName}
            claimedRole={responseClaimedRole}
            actionName={responseActionName}
            onChallenge={handleChallenge}
            onAllow={handlePass}
          />
        )}

        {showBlockModal && (
          <BlockModal
            actorName={responseActorName}
            actionName={responseActionName}
            availableBlockRoles={availableBlockRoles}
            onBlock={handleBlock}
            onAllow={handlePass}
            onChallenge={handleChallenge}
            canChallenge={canChallenge}
          />
        )}

        {showLoseInfluenceModal && pendingLoseInfluence && (
          <LoseInfluenceModal
            reason={pendingLoseInfluence.reason}
            activeCards={localPlayer?.cards.filter((c) => !c.isRevealed) || []}
            onConfirm={handleLoseInfluenceConfirm}
          />
        )}

        {showExchangeModal && pendingExchange && (
          <ExchangeModal
            activeCards={localPlayer?.cards.filter((c) => !c.isRevealed) || []}
            drawnCards={pendingExchange.drawnCards}
            onConfirm={handleExchangeConfirm}
          />
        )}
      </AnimatePresence>

      {/* ─── GAME OVER MODAL ─── */}
      <AnimatePresence>
        {gameState?.phase === 'GAME_OVER' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center coup-modal-overlay p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="coup-modal-panel p-8 max-w-sm w-full text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl neu-flat flex items-center justify-center mx-auto text-amber-700 shadow-lg">
                <DukeIcon className="w-8 h-8" />
              </div>

              <h1 className="text-stone-900 text-2xl font-black uppercase tracking-widest">
                VICTORY DECIDED
              </h1>

              <div className="neu-inset-sm px-6 py-3.5 rounded-xl inline-block w-full">
                <p className="text-amber-900 text-lg font-black">
                  {gameState.players.find((p) => p.id === gameState.winnerId)?.name}
                </p>
                <p className="text-stone-500 text-[10px] font-extrabold tracking-widest uppercase mt-0.5">
                  SEIZES THE COURT THRONE
                </p>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="neu-btn neu-btn-gold w-full py-3.5 rounded-xl font-black text-xs tracking-widest uppercase cursor-pointer shadow-md"
              >
                Play New Match
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CoupGame;
