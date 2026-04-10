import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { translations, type Language, getT } from '../i18n/translations';

export type { Language };

export type TrackType = 'youtube' | 'spotify' | 'deezer' | 'radio';

export interface Track {
  id: string;
  type: TrackType;
  platform: TrackType;
  title: string;
  artist: string;
  thumbnail?: string;
  duration?: number;
  isLive?: boolean;
  videoId?: string;
  streamUrl?: string;
  previewUrl?: string;
  spotifyId?: string;
  addedBy: string;
  addedByName: string;
}

export interface Participant {
  socketId: string;
  userId: string;
  userName: string;
  avatarColor: string;
  joinedAt: number;
}

export interface RoomInfo {
  id: string;
  name: string;
  isPrivate: boolean;
  participantCount: number;
  currentTrack: Track | null;
  createdBy?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface MusicContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  userId: string;
  userName: string;
  setUserName: (name: string) => void;
  currentRoomId: string;
  rooms: RoomInfo[];
  participants: Participant[];
  isHost: boolean;
  mySocketId: string;
  wsStatus: 'connecting' | 'connected' | 'disconnected';
  joinRoom: (roomId: string, password?: string) => void;
  createRoom: (name: string, password?: string) => Promise<{ id: string; name: string }>;
  deleteRoom: (roomId: string) => Promise<boolean>;
  fetchRooms: () => Promise<void>;
  currentTrack: Track | null;
  playbackState: 'playing' | 'paused' | 'stopped';
  position: number;
  duration: number;
  queue: Track[];
  history: Track[];
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: boolean;
  skipVotes: string[];
  canControl: boolean;
  playTrack: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  seek: (position: number) => void;
  next: () => void;
  previous: () => void;
  addToQueue: (track: Track) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  voteSkip: () => void;
  playlists: Playlist[];
  saveToPlaylist: (track: Track, playlistId: string) => void;
  activePlatform: TrackType | 'all';
  setActivePlatform: (p: TrackType | 'all') => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

function genUserId() {
  let id = localStorage.getItem('ss-uid');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('ss-uid', id); }
  return id;
}
function genUserName() {
  let name = localStorage.getItem('ss-uname');
  if (!name) {
    const adj = ['Cool', 'Fast', 'Lazy', 'Wild', 'Chill', 'Neon', 'Dark', 'Loud'];
    const noun = ['DJ', 'Vibe', 'Beat', 'Drop', 'Wave', 'Bass', 'Flow', 'Mix'];
    name = `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}${Math.floor(Math.random() * 99)}`;
    localStorage.setItem('ss-uname', name);
  }
  return name;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('ss-lang') as Language) || 'en');
  const t = useCallback((key: keyof typeof translations.en) => getT(language)(key), [language]);
  const setLanguage = (lang: Language) => { setLanguageState(lang); localStorage.setItem('ss-lang', lang); };

  const [userId] = useState(genUserId);
  const [userName, setUserNameState] = useState(genUserName);
  const setUserName = (name: string) => { setUserNameState(name); localStorage.setItem('ss-uname', name); };

  const [currentRoomId, setCurrentRoomId] = useState('general');
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [mySocketId, setMySocketId] = useState('');
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playbackState, setPlaybackState] = useState<'playing' | 'paused' | 'stopped'>('stopped');
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [skipVotes, setSkipVotes] = useState<string[]>([]);
  const [activePlatform, setActivePlatform] = useState<TrackType | 'all'>('all');
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: 'p1', name: 'Mis Favoritas', tracks: [] },
    { id: 'p2', name: 'Para Trabajar', tracks: [] },
  ]);

  const audio = useRef<HTMLAudioElement>(new Audio());
  const ytPlayer = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const currentRoomIdRef = useRef('general');
  const currentTrackRef = useRef<Track | null>(null);
  const queueRef = useRef<Track[]>([]);
  const historyRef = useRef<Track[]>([]);
  const participantsRef = useRef<Participant[]>([]);
  const userIdRef = useRef(userId);
  const userNameRef = useRef(userName);
  const isHostRef = useRef(false);
  const mySocketIdRef = useRef('');
  const skipVotesRef = useRef<string[]>([]);
  const volumeRef = useRef(80);
  const repeatRef = useRef(false);
  const ytInited = useRef(false);
  const isConnectedRef = useRef(false);
  const skippingRef = useRef(false);
  const playTrackInternalRef = useRef<(track: Track) => void>(() => {});

  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { participantsRef.current = participants; }, [participants]);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);
  useEffect(() => { userNameRef.current = userName; }, [userName]);
  useEffect(() => { currentRoomIdRef.current = currentRoomId; }, [currentRoomId]);
  useEffect(() => { skipVotesRef.current = skipVotes; }, [skipVotes]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);

  const canControl = isHost || (currentTrack?.addedBy === userId);

  // ── Audio element events ──────────────────────────────────────────────────
  useEffect(() => {
    const el = audio.current;
    el.volume = 0.8;
    const onTime = () => setPosition(el.currentTime);
    const onDur = () => setDuration(isNaN(el.duration) ? 0 : el.duration);
    const onEnded = () => handleTrackEnd();
    const onError = () => {
      // Don't stop overlay for Spotify (it has no audio URL by design)
      if (currentTrackRef.current?.type !== 'spotify') setPlaybackState('stopped');
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('durationchange', onDur);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('durationchange', onDur);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, []);

  // ── YouTube IFrame API ────────────────────────────────────────────────────
  const initYTPlayer = useCallback((videoId: string) => {
    const load = () => {
      const container = document.getElementById('yt-player-container');
      if (!container) return;
      if (ytPlayer.current) {
        ytPlayer.current.loadVideoById(videoId);
        return;
      }
      ytPlayer.current = new window.YT.Player('yt-player-container', {
        height: '1', width: '1',
        videoId,
        playerVars: { autoplay: 1, controls: 0, fs: 0 },
        events: {
          onStateChange: (e: any) => {
            const S = window.YT?.PlayerState;
            if (!S) return;
            if (e.data === S.PLAYING) setPlaybackState('playing');
            if (e.data === S.PAUSED) setPlaybackState('paused');
            if (e.data === S.ENDED && !skippingRef.current) handleTrackEnd();
          },
        },
      });
    };

    if (!ytInited.current) {
      ytInited.current = true;
      if (window.YT?.Player) {
        load();
      } else {
        window.onYouTubeIframeAPIReady = load;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    } else if (window.YT?.Player) {
      load();
    } else {
      window.onYouTubeIframeAPIReady = load;
    }
  }, []);

  // ── YouTube position tracking ─────────────────────────────────────────────
  useEffect(() => {
    if (playbackState !== 'playing' || currentTrack?.type !== 'youtube') return;
    const id = setInterval(() => {
      if (ytPlayer.current?.getCurrentTime) {
        setPosition(ytPlayer.current.getCurrentTime());
        setDuration(ytPlayer.current.getDuration?.() || 0);
      }
    }, 500);
    return () => clearInterval(id);
  }, [playbackState, currentTrack?.type]);

  // ── Volume ────────────────────────────────────────────────────────────────
  useEffect(() => {
    audio.current.volume = isMuted ? 0 : volume / 100;
    audio.current.muted = isMuted;
    ytPlayer.current?.setVolume?.(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // ── Track end handler (stable ref) ────────────────────────────────────────
  const handleTrackEnd = useCallback(() => {
    if (repeatRef.current && currentTrackRef.current) {
      const t = currentTrackRef.current;
      if (t.type === 'youtube') {
        ytPlayer.current?.seekTo?.(0, true);
        ytPlayer.current?.playVideo?.();
      } else {
        audio.current.currentTime = 0;
        audio.current.play().catch(() => {});
      }
      return;
    }
    if (queueRef.current.length > 0) {
      // Route through server so all room participants stay in sync
      skippingRef.current = true;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'skip-track' }));
      } else {
        // Fallback: advance locally when offline
        const q = queueRef.current;
        const next = q[0];
        queueRef.current = q.slice(1);
        setQueue(q.slice(1));
        playTrackInternalRef.current(next);
      }
    } else {
      setPlaybackState('stopped');
    }
  }, []);

  const sendWs = useCallback((type: string, data?: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  const playTrackInternal = useCallback((track: Track) => {
    skippingRef.current = false;
    const el = audio.current;
    el.pause();
    // Always stop YouTube player when changing tracks to avoid ghost playback
    if (track.type !== 'youtube') {
      ytPlayer.current?.stopVideo?.();
    }
    setCurrentTrack(track);
    setPlaybackState('playing');
    setPosition(0);
    setDuration(0);
    setSkipVotes([]);

    if (track.type === 'youtube' && track.videoId) {
      initYTPlayer(track.videoId);
    } else if (track.type !== 'spotify') {
      // Deezer / Radio have real audio URLs
      const src = track.streamUrl || track.previewUrl || '';
      if (src) {
        el.src = src;
        el.load();
        el.play().catch(() => {});
      }
    }
    // Spotify tracks are played via embedded iframe; no audio-element needed here
  }, [initYTPlayer]);
  // Keep ref in sync so handleTrackEnd can call it without a circular dep
  useEffect(() => { playTrackInternalRef.current = playTrackInternal; }, [playTrackInternal]);

  // ── WebSocket message handler (no state deps to avoid reconnect loops) ────
  const handleWsMessage = useCallback((type: string, data: any) => {
    switch (type) {
      case 'room-joined':
        setIsHost(data.isHost);
        isHostRef.current = data.isHost;
        mySocketIdRef.current = data.socketId;
        setMySocketId(data.socketId);
        // Deduplicate participants by userId
        setParticipants(dedupeParticipants(data.room.participants || []));
        setQueue(data.room.queue || []);
        if (data.room.currentTrack && data.room.isPlaying) {
          playTrackInternal(data.room.currentTrack);
          if (data.currentPosition > 2) {
            setTimeout(() => {
              audio.current.currentTime = data.currentPosition;
              ytPlayer.current?.seekTo?.(data.currentPosition, true);
            }, 500);
          }
        }
        break;
      case 'track-changed':
        if (data.track) playTrackInternal(data.track);
        else { audio.current.pause(); ytPlayer.current?.pauseVideo?.(); setPlaybackState('stopped'); setCurrentTrack(null); }
        break;
      case 'playback-state':
        if (data.isPlaying) {
          audio.current.play().catch(() => {});
          ytPlayer.current?.playVideo?.();
          setPlaybackState('playing');
        } else {
          audio.current.pause();
          ytPlayer.current?.pauseVideo?.();
          setPlaybackState('paused');
        }
        setPosition(data.position);
        break;
      case 'seek':
        audio.current.currentTime = data.position;
        ytPlayer.current?.seekTo?.(data.position, true);
        setPosition(data.position);
        break;
      case 'queue-updated':
        setQueue(data || []);
        break;
      case 'participants-update':
        setParticipants(dedupeParticipants(data || []));
        break;
      case 'host-changed':
        setIsHost(data.hostSocketId === mySocketIdRef.current);
        isHostRef.current = data.hostSocketId === mySocketIdRef.current;
        break;
      case 'skip-vote': {
        const newVotes = [...skipVotesRef.current];
        if (!newVotes.includes(data.voterId)) {
          newVotes.push(data.voterId);
          setSkipVotes(newVotes);
          const threshold = Math.ceil(participantsRef.current.length / 2);
          if (newVotes.length >= threshold) {
            handleTrackEnd();
            setSkipVotes([]);
          }
        }
        break;
      }
      case 'position-sync':
        if (!isHostRef.current) {
          const diff = Math.abs((data.position || 0) - audio.current.currentTime);
          if (diff > 2) {
            audio.current.currentTime = data.position;
            ytPlayer.current?.seekTo?.(data.position, true);
          }
        }
        break;
      case 'rooms-list':
        setRooms(data || []);
        break;
      case 'room-deleted':
        setRooms(prev => prev.filter(r => r.id !== data.roomId));
        if (currentRoomIdRef.current === data.roomId) {
          setCurrentRoomId('general');
          currentRoomIdRef.current = 'general';
        }
        break;
    }
  }, [handleTrackEnd, playTrackInternal]);

  // ── WebSocket connection (stable, no re-creating on state changes) ────────
  useEffect(() => {
    let destroyed = false;
    let ws: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (destroyed) return;
      setWsStatus('connecting');
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${proto}//${window.location.host}/api/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (destroyed) { ws?.close(); return; }
        isConnectedRef.current = true;
        setWsStatus('connected');
        ws!.send(JSON.stringify({
          type: 'join-room',
          data: { roomId: currentRoomIdRef.current, userId: userIdRef.current, userName: userNameRef.current },
        }));
      };

      ws.onmessage = (e) => {
        try {
          const { type, data } = JSON.parse(e.data);
          handleWsMessage(type, data);
        } catch {}
      };

      ws.onclose = () => {
        isConnectedRef.current = false;
        if (!destroyed) {
          setWsStatus('disconnected');
          retryTimer = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => ws?.close();
    };

    connect();

    return () => {
      destroyed = true;
      clearTimeout(retryTimer);
      ws?.close();
      wsRef.current = null;
    };
  }, [handleWsMessage]);

  // ── Host: periodic position broadcast ─────────────────────────────────────
  useEffect(() => {
    if (!isHost || playbackState !== 'playing') return;
    const id = setInterval(() => {
      const pos = currentTrackRef.current?.type === 'youtube'
        ? (ytPlayer.current?.getCurrentTime?.() || 0)
        : audio.current.currentTime;
      sendWs('position-update', { position: pos });
    }, 5000);
    return () => clearInterval(id);
  }, [isHost, playbackState, sendWs]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const playTrack = useCallback((track: Track) => {
    if (currentTrackRef.current) {
      historyRef.current = [currentTrackRef.current, ...historyRef.current].slice(0, 50);
      setHistory(historyRef.current);
    }
    playTrackInternal(track);
    sendWs('play-track', track);
    toast({ title: t('nowPlaying'), description: `${track.title} — ${track.artist}` });
  }, [playTrackInternal, sendWs, t, toast]);

  const pause = useCallback(() => {
    audio.current.pause();
    ytPlayer.current?.pauseVideo?.();
    setPlaybackState('paused');
    sendWs('pause');
  }, [sendWs]);

  const resume = useCallback(() => {
    if (currentTrackRef.current?.type === 'youtube') ytPlayer.current?.playVideo?.();
    else audio.current.play().catch(() => {});
    setPlaybackState('playing');
    sendWs('resume');
  }, [sendWs]);

  const seek = useCallback((pos: number) => {
    audio.current.currentTime = pos;
    ytPlayer.current?.seekTo?.(pos, true);
    setPosition(pos);
    sendWs('seek', { position: pos });
  }, [sendWs]);

  const next = useCallback(() => {
    // Guard: prevent YouTube ENDED from double-advancing when we manually skip
    skippingRef.current = true;
    ytPlayer.current?.stopVideo?.();
    audio.current.pause();
    // Server will broadcast track-changed back to all clients (including us)
    // which calls playTrackInternal and clears skippingRef
    sendWs('skip-track');
  }, [sendWs]);

  const previous = useCallback(() => {
    const h = historyRef.current;
    if (h.length > 0) {
      const prev = h[0];
      historyRef.current = h.slice(1);
      setHistory(h.slice(1));
      if (currentTrackRef.current) {
        queueRef.current = [currentTrackRef.current, ...queueRef.current];
        setQueue(queueRef.current);
      }
      playTrackInternal(prev);
    } else {
      seek(0);
    }
  }, [playTrackInternal, seek]);

  const addToQueue = useCallback((track: Track) => {
    queueRef.current = [...queueRef.current, track];
    setQueue(queueRef.current);
    sendWs('add-to-queue', track);
    toast({ title: t('addedToQueue'), description: track.title });
  }, [sendWs, t, toast]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    setIsMuted(false);
    audio.current.volume = v / 100;
    ytPlayer.current?.setVolume?.(v);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(m => {
      const next = !m;
      audio.current.muted = next;
      ytPlayer.current?.setVolume?.(next ? 0 : volumeRef.current);
      return next;
    });
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);
  const toggleRepeat = useCallback(() => setRepeat(r => { repeatRef.current = !r; return !r; }), []);

  const voteSkip = useCallback(() => {
    sendWs('vote-skip', { userName: userNameRef.current });
    toast({ title: t('voteSkip'), description: `${skipVotesRef.current.length + 1} votos` });
  }, [sendWs, t, toast]);

  const joinRoom = useCallback((roomId: string, password?: string) => {
    setCurrentRoomId(roomId);
    currentRoomIdRef.current = roomId;
    sendWs('join-room', { roomId, userId: userIdRef.current, userName: userNameRef.current, password });
  }, [sendWs]);

  const createRoom = useCallback(async (name: string, password?: string) => {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password, createdBy: userIdRef.current }),
    });
    const room = await res.json();
    joinRoom(room.id, password);
    return room;
  }, [joinRoom]);

  const deleteRoom = useCallback(async (roomId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdRef.current }),
      });
      if (res.ok) {
        setRooms(prev => prev.filter(r => r.id !== roomId));
        sendWs('delete-room', { roomId });
        if (currentRoomIdRef.current === roomId) {
          setCurrentRoomId('general');
          currentRoomIdRef.current = 'general';
          sendWs('join-room', { roomId: 'general', userId: userIdRef.current, userName: userNameRef.current });
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [sendWs]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(data);
    } catch {}
  }, []);

  const saveToPlaylist = useCallback((track: Track, playlistId: string) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, tracks: [...p.tracks, track] } : p));
    toast({ title: t('addedToQueue'), description: track.title });
  }, [t, toast]);

  return (
    <MusicContext.Provider value={{
      language, setLanguage, t,
      userId, userName, setUserName,
      currentRoomId, rooms, participants, isHost, mySocketId, wsStatus,
      joinRoom, createRoom, deleteRoom, fetchRooms,
      currentTrack, playbackState, position, duration, queue, history,
      volume, isMuted, shuffle, repeat, skipVotes, canControl,
      playTrack, pause, resume, seek, next, previous, addToQueue,
      setVolume, toggleMute, toggleShuffle, toggleRepeat, voteSkip,
      playlists, saveToPlaylist,
      activePlatform, setActivePlatform,
    }}>
      <>
        {children}
        <div
          id="yt-player-container"
          style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '1px', height: '1px', overflow: 'hidden', pointerEvents: 'none' }}
        />
      </>
    </MusicContext.Provider>
  );
}

function dedupeParticipants(participants: Participant[]): Participant[] {
  const seen = new Set<string>();
  return participants.filter(p => {
    if (seen.has(p.userId)) return false;
    seen.add(p.userId);
    return true;
  });
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}
