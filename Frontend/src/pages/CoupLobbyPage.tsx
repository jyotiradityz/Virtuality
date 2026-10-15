import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SocketTransport } from '../api/socketTransport';
import type { RoomInfo } from '../types/game';
import {
  DukeIcon,
  CoupSwordsIcon,
  CheckIcon,
  CrossIcon,
  CopyIcon,
} from '../components/shared/CoupIcons';
import '../styles/coup.css';

export default function CoupLobbyPage() {
  const { lobbyCode } = useParams<{ lobbyCode: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userName = searchParams.get('name') || 'Guest Player';
  const isHostQuery = searchParams.get('isHost') === 'true';
  const initialMax = parseInt(searchParams.get('maxPlayers') || '6');

  const [maxPlayers, setMaxPlayers] = useState<number>(initialMax);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Authoritative Socket Transport (single instance per page lifecycle)
  const [transport] = useState(() => new SocketTransport());
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const hasInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    // Prevent duplicate room creation or infinite loop
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    transport.connect();

    // Authoritative lobby updates from server
    transport.onLobbyUpdate((info) => {
      setRoomInfo(info);
      if (info.isGameStarted) {
        const activeCode = info.roomCode || lobbyCode;
        navigate(`/coup/${activeCode}/game?name=${encodeURIComponent(userName)}`);
      }
    });

    const isCreating = isHostQuery || lobbyCode === 'create' || lobbyCode === 'new';

    if (isCreating) {
      transport
        .createRoom(userName)
        .then((info) => {
          setRoomInfo(info);
          if (info.roomCode && info.roomCode !== lobbyCode) {
            // Replace URL cleanly without isHost to ensure refreshing joins existing room
            navigate(
              `/coup/${info.roomCode}?name=${encodeURIComponent(userName)}&maxPlayers=${maxPlayers}`,
              { replace: true }
            );
          }
        })
        .catch((err) => {
          console.error('Failed to create room:', err);
          setConnectionError('Could not create room on server. Check server connection.');
        });
    } else if (lobbyCode && lobbyCode !== 'create' && lobbyCode !== 'new') {
      transport
        .joinRoom(lobbyCode, userName)
        .then((info) => setRoomInfo(info))
        .catch((err) => {
          console.error('Failed to join room:', err);
          setConnectionError('Room code not found or game already in progress.');
        });
    }

    return () => {
      transport.disconnect();
    };
  }, []);

  const activeCode = roomInfo?.roomCode || (lobbyCode !== 'create' && lobbyCode !== 'new' ? lobbyCode : '') || '';

  const handleCopyCode = () => {
    if (activeCode) {
      navigator.clipboard.writeText(activeCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCopyInviteLink = () => {
    if (!activeCode) return;
    const inviteUrl = `${window.location.origin}/coup/${activeCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  const toggleMyReady = () => {
    if (!roomInfo) return;
    const myPlayer = roomInfo.players.find((p) => p.name === userName || p.id === roomInfo.hostId);
    const nextReady = myPlayer ? !myPlayer.isReady : true;

    transport.setReady(nextReady).catch((e) => console.error(e));

    setRoomInfo({
      ...roomInfo,
      players: roomInfo.players.map((p) =>
        p.name === userName ? { ...p, isReady: nextReady } : p
      ),
    });
  };

  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      if (roomInfo) {
        await transport.startGame();
      }
      setTimeout(() => {
        setIsStarting(false);
        navigate(`/coup/${activeCode}/game?name=${encodeURIComponent(userName)}`);
      }, 400);
    } catch (e: any) {
      console.error(e);
      alert(
        e?.message ||
          'Failed to start game. Make sure at least 2 players have joined and all players are ready.'
      );
      setIsStarting(false);
    }
  };

  const realPlayers = roomInfo?.players || [];
  const isHost = roomInfo ? roomInfo.hostId === realPlayers.find((p) => p.name === userName)?.id : isHostQuery;
  const canStart = realPlayers.length >= 2 && realPlayers.every((p) => p.isReady);

  return (
    <div className="coup-cream-room min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* HEADER */}
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center z-10 shrink-0">
        <button
          onClick={() => navigate('/coup')}
          className="neu-btn px-4 py-2 rounded-xl text-xs font-bold text-stone-700 flex items-center gap-2 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Leave Chamber
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl neu-flat flex items-center justify-center text-amber-600">
            <CoupSwordsIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black text-stone-900 tracking-wider uppercase">
              GAME CHAMBER
            </h1>
            <span className="text-[9px] text-stone-500 font-bold tracking-wider block">
              Multiplayer Room
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full max-w-5xl mx-auto my-auto py-4 z-10 space-y-4">
        
        {/* ROOM CODE & SHARE BANNER */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="neu-flat p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl neu-flat flex items-center justify-center text-amber-600">
              <DukeIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                ROOM ACCESS CODE
              </span>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-2xl sm:text-3xl font-mono font-black tracking-[0.25em] text-amber-800">
                  {activeCode || 'CONNECTING...'}
                </span>
                {activeCode && (
                  <button
                    onClick={handleCopyCode}
                    className="neu-btn px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                    <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeCode && (
              <button
                onClick={handleCopyInviteLink}
                className="neu-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer text-stone-800 hover:text-stone-950"
              >
                <CopyIcon className="w-4 h-4 text-amber-600" />
                <span>{isLinkCopied ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>
            )}
            <div className="neu-inset-sm px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-stone-500 block tracking-wider">
                Players
              </span>
              <span className="text-sm font-black text-stone-900">
                {realPlayers.length} / {maxPlayers}
              </span>
            </div>
          </div>
        </motion.div>

        {connectionError && (
          <div className="p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold text-center">
            {connectionError}
          </div>
        )}

        {/* 2-COLUMN GRID: PLAYERS ROSTER & RULES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          
          {/* LEFT: CONNECTED PLAYERS */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-6 neu-flat p-5 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center border-b border-stone-200 pb-3 mb-4">
                <h2 className="text-xs font-black text-stone-800 uppercase tracking-[0.2em]">
                  CONNECTED PLAYERS ({realPlayers.length}/{maxPlayers})
                </h2>
                {isHost && realPlayers.length < maxPlayers && activeCode && (
                  <button
                    onClick={() => transport.addTestPlayer(activeCode)}
                    className="neu-btn px-2.5 py-1 rounded-lg text-[11px] font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    + Add Test Player
                  </button>
                )}
              </div>

              {/* Players List */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {realPlayers.length === 0 ? (
                  <div className="py-8 text-center text-stone-500 text-xs font-medium space-y-2">
                    <div className="w-7 h-7 mx-auto rounded-full border-2 border-stone-400 border-t-amber-500 animate-spin" />
                    <p>Connecting player seat to chamber...</p>
                  </div>
                ) : (
                  realPlayers.map((player) => {
                    const isMe = player.name === userName;
                    return (
                      <div
                        key={player.id}
                        className={`flex justify-between items-center p-3 rounded-xl transition-all ${
                          isMe
                            ? 'neu-flat bg-white border border-amber-300/80 shadow-sm'
                            : 'neu-inset-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${player.isHost ? 'bg-amber-100 text-amber-700' : 'bg-stone-200 text-stone-600'}`}>
                            {player.isHost ? <DukeIcon className="w-4 h-4" /> : <CoupSwordsIcon className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-black text-xs text-stone-900 block">
                              {player.name} {isMe && <span className="text-amber-600 text-[10px] ml-1 font-bold">(You)</span>}
                            </span>
                            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                              {player.isHost ? 'Host' : 'Player'}
                            </span>
                          </div>
                        </div>

                        {isMe ? (
                          <button
                            onClick={toggleMyReady}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                              player.isReady
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'neu-btn text-stone-700 hover:text-stone-900'
                            }`}
                          >
                            {player.isReady ? <CheckIcon className="w-3 h-3 text-white" /> : <CrossIcon className="w-3 h-3" />}
                            <span>{player.isReady ? 'Ready' : 'Set Ready'}</span>
                          </button>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                              player.isReady
                                ? 'text-emerald-700 bg-emerald-100 border border-emerald-300'
                                : 'text-stone-500 bg-stone-100 border border-stone-200'
                            }`}
                          >
                            {player.isReady ? <CheckIcon className="w-3 h-3" /> : <CrossIcon className="w-3 h-3" />}
                            <span>{player.isReady ? 'Ready' : 'Waiting'}</span>
                          </span>
                        )}
                      </div>
                    );
                  })
                )}

                {/* Empty Slots */}
                {Array.from({ length: Math.max(0, maxPlayers - realPlayers.length) }).map((_, i) => (
                  <div
                    key={`slot-${i}`}
                    className="p-3 rounded-xl neu-inset-sm flex justify-between items-center text-stone-400 text-[10px] font-bold"
                  >
                    <span>Seat {realPlayers.length + i + 1} Open</span>
                    <span className="text-[9px] text-stone-400 uppercase tracking-wider">Waiting</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-xl neu-inset-sm text-center text-[10px] font-bold text-stone-500">
              Share the room code or invite link to play with friends on any device.
            </div>
          </motion.div>

          {/* RIGHT: RULES & HOST CONTROLS */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-6 neu-flat p-5 rounded-2xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="border-b border-stone-200 pb-3">
                <h2 className="text-xs font-black text-stone-800 uppercase tracking-[0.2em]">
                  GAME RULES & SETUP
                </h2>
              </div>

              {/* Max Players */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-stone-600 mb-1.5">
                  Max Players
                </label>
                <div className="flex p-1 rounded-xl neu-inset-sm gap-1">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMaxPlayers(num)}
                      className={`flex-1 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                        maxPlayers === num
                          ? 'neu-btn bg-amber-500 text-white font-black shadow-sm'
                          : 'text-stone-500 hover:text-stone-900'
                      }`}
                    >
                      {num}P
                    </button>
                  ))}
                </div>
              </div>

              {/* Deck Composition Info */}
              <div className="p-3.5 rounded-xl neu-inset-sm border border-stone-200 text-xs text-stone-700 space-y-1">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                  Deck Composition
                </span>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  15 Influence Cards (3x Duke, Assassin, Captain, Ambassador, Contessa). Each player begins with 2 secret cards and 2 coins.
                </p>
              </div>
            </div>

            {/* Launch Game Button */}
            <div className="pt-4">
              {isHost ? (
                <button
                  onClick={handleStartGame}
                  disabled={!canStart || isStarting}
                  className={`w-full py-3.5 rounded-xl neu-btn bg-gradient-to-r from-amber-500 to-amber-600 text-white uppercase text-xs font-black tracking-wider transition-all cursor-pointer ${
                    !canStart || isStarting ? 'opacity-40 cursor-not-allowed shadow-none' : 'shadow-md'
                  }`}
                >
                  {isStarting
                    ? 'Launching Match...'
                    : canStart
                    ? 'Launch Game'
                    : `Need 2+ Players & All Ready (${realPlayers.filter((p) => p.isReady).length}/${realPlayers.length} Ready)`}
                </button>
              ) : (
                <div className="p-3 rounded-xl neu-inset-sm text-center text-xs font-bold text-stone-600">
                  Waiting for host to launch the game...
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center text-[10px] font-bold text-stone-400 tracking-wider uppercase z-10 shrink-0">
        © 2026 Virtuality Gaming • Coup Tabletop
      </footer>

    </div>
  );
}
