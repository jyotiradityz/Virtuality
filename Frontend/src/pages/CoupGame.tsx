import React, { useState } from 'react';
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
import '../styles/coup.css';

export const CoupGame: React.FC = () => {
  const [inLobby, setInLobby] = useState(true);
  const [gameMode, setGameMode] = useState<'MOCK' | 'SOCKET'>('MOCK');
  const [botCount, setBotCount] = useState(3);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const { transport } = useGame(gameMode, botCount);
  const gameState = useGameStore((state) => state.gameState);

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

  if (inLobby && !gameState) {
    if (roomInfo) {
      return (
        <div className="w-full h-screen flex items-center justify-center select-none" style={{ backgroundColor: '#ece7dc' }}>
          <div className="coup-modal-panel p-8 max-w-md w-full space-y-5 text-center">
            <h2 className="text-amber-900 text-2xl font-black tracking-widest uppercase">
              ROOM: {roomInfo.roomCode}
            </h2>
            <div className="neu-pressed p-4 rounded-2xl space-y-2">
              <p className="text-stone-600 text-xs font-bold uppercase tracking-wider mb-2">PLAYERS IN LOBBY ({roomInfo.players.length}/6)</p>
              {roomInfo.players.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm font-black text-stone-800">
                  <span>{p.name} {p.isHost && '👑'}</span>
                  <span className="text-xs text-emerald-600">READY</span>
                </div>
              ))}
            </div>

            {roomInfo.hostId ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartMultiplayerGame}
                className="action-btn primary w-full py-3.5 font-black text-xs tracking-wider"
              >
                🚀 START MULTIPLAYER GAME
              </motion.button>
            ) : (
              <p className="text-stone-500 text-xs font-bold animate-pulse">Waiting for host to start...</p>
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

  // Derive Modals strictly from gameState phase & state
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

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans select-none" style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: '#ece7dc' }}>
      {/* Game Table - Full screen background */}
      <GameTable
        selectedCardId={selectedCardId}
        onCardSelect={(cardId) => setSelectedCardId(cardId === selectedCardId ? null : cardId)}
      />

      {/* Game Log - Bottom Left */}
      <GameLog entries={gameState?.gameLog || []} />

      {/* Local Player Bottom Console (Action Menu + Influence Cards + Coins + Avatar) */}
      {localPlayer && (
        <LocalPlayerConsole
          player={localPlayer}
          selectedCardId={selectedCardId}
          onCardSelect={(cardId) => setSelectedCardId(cardId === selectedCardId ? null : cardId)}
          onPerformAction={handlePerformAction}
        />
      )}

      {/* Turn Status Bar - Top Center */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20"
      >
        <div className="turn-indicator px-6 py-2 flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2.5 h-2.5 rounded-full bg-amber-500"
          />
          <span className="text-amber-900 text-xs font-black uppercase tracking-[0.25em]">
            {gameState?.phase === 'GAME_OVER'
              ? '🏆 GAME OVER'
              : gameState?.players[gameState.turnIndex]?.isLocalPlayer
              ? '⚔️ YOUR TURN'
              : `${gameState?.players[gameState?.turnIndex || 0]?.name}'s Turn`}
          </span>
          {gameState && gameState.phase !== 'GAME_OVER' && (
            <div className="neu-pressed px-2.5 py-0.5 rounded-md ml-1">
              <span className="text-stone-600 text-[9px] font-black tracking-wider">
                R{gameState.turnIndex + 1}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Coup Title Watermark */}
      <div className="absolute top-4 left-5 z-20 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-amber-800/20 font-black text-2xl tracking-[0.3em] uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
            COUP
          </span>
        </div>
      </div>

      {/* Modals */}
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

      {/* Game Over Banner */}
      <AnimatePresence>
        {gameState?.phase === 'GAME_OVER' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center coup-modal-overlay p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="coup-modal-panel p-8 max-w-sm w-full text-center space-y-5"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="text-5xl mb-2"
              >
                👑
              </motion.div>

              <h1 className="text-amber-800 text-3xl font-black uppercase tracking-[0.2em]"
                  style={{ fontFamily: "'Cinzel', serif" }}>
                GAME OVER
              </h1>

              <div className="neu-pressed px-6 py-3 rounded-2xl inline-block">
                <p className="text-stone-900 text-lg font-black">
                  🏆 {gameState.players.find((p) => p.id === gameState.winnerId)?.name}
                </p>
                <p className="text-amber-800 text-[10px] font-extrabold tracking-widest uppercase mt-1">
                  IS VICTORIOUS
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="action-btn primary w-full py-3 text-center font-black text-sm tracking-widest"
              >
                ⚔️ PLAY AGAIN
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoupGame;
