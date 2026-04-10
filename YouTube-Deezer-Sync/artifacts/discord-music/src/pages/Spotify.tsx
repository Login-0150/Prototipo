import { useEffect, useState, useCallback } from "react";
import { useMusic, type Track } from "../context/MusicContext";
import { SiSpotify } from "react-icons/si";
import { Play, Plus, LogOut, Crown, Music, Loader2 } from "lucide-react";

interface SpotifyUser {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  displayName: string;
  email: string;
  imageUrl: string | null;
  isPremium: boolean;
}

interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  thumbnail: string;
  spotifyId: string;
}

const FEATURED_TRACKS: SpotifyTrack[] = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', thumbnail: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', spotifyId: '0VjIjW4GlUZAMYd2vXMi3b' },
  { id: '2', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", thumbnail: 'https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14', spotifyId: '4LRPiXqCikLlN15c3yImP7' },
  { id: '3', title: 'Unholy', artist: 'Sam Smith & Kim Petras', album: 'Gloria', thumbnail: 'https://i.scdn.co/image/ab67616d0000b273a9a1e78bb82ae0c9b40a9fe9', spotifyId: '3nqQXoyQOWXiESFLlDF1hG' },
  { id: '4', title: 'CUFF IT', artist: 'Beyoncé', album: 'Renaissance', thumbnail: 'https://i.scdn.co/image/ab67616d0000b2730e58db6f8d46a63f6d1ce7f1', spotifyId: '5WKMBFDJTjT33dY0cBnvOm' },
  { id: '5', title: 'Flowers', artist: 'Miley Cyrus', album: 'Endless Summer Vacation', thumbnail: 'https://i.scdn.co/image/ab67616d0000b273f429549123dbe8552764ba1d', spotifyId: '0yLdNVWF3Srea0uzk55zFn' },
  { id: '6', title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', thumbnail: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5', spotifyId: '0V3wPSX9ygBnCm8psDIegu' },
  { id: '7', title: 'DESPECHÁ', artist: 'Rosalía', album: 'MOTOMAMI+', thumbnail: 'https://i.scdn.co/image/ab67616d0000b2731d6d4568e0e68b0cb5d7cd65', spotifyId: '6B2oEWqCumBN6fAP9jHNzL' },
  { id: '8', title: 'Ella Baila Sola', artist: 'Eslabon Armado', album: 'Ella Baila Sola', thumbnail: 'https://i.scdn.co/image/ab67616d0000b273d9f2c53e7b3b2a36b0e3748d', spotifyId: '2wqoEiQnGFMpCSDfBbCp47' },
  { id: '9', title: 'Cruel Summer', artist: 'Taylor Swift', album: 'Lover', thumbnail: 'https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a9c182b4f1', spotifyId: '1BxfuPKGuaTgP7aM0Bbdwr' },
  { id: '10', title: 'Calm Down', artist: 'Rema & Selena Gomez', album: 'Rave & Roses Ultra', thumbnail: 'https://i.scdn.co/image/ab67616d0000b273c58c2c8b04085c5ed6e9e82b', spotifyId: '0WtM2NBus58o0ljkP7iOIy' },
  { id: '11', title: 'Bad Habit', artist: 'Steve Lacy', album: 'Gemini Rights', thumbnail: 'https://i.scdn.co/image/ab67616d0000b273c1a02f2e898d7d4e1e35dcfb', spotifyId: '3iVcZ5G6tvkXZkZKlMpIUs' },
  { id: '12', title: 'Quevedo: Bzrp Music Sessions #52', artist: 'Bizarrap & Quevedo', album: 'Session #52', thumbnail: 'https://i.scdn.co/image/ab67616d0000b27349d694203245f241a1bcaa72', spotifyId: '4nrPB8O7Y7wsOCJdgXkthe' },
];

const PLAYLISTS = [
  { name: 'Global Top 50', color: 'from-green-500 to-emerald-700', tracks: '50' },
  { name: 'Viral 50', color: 'from-violet-500 to-purple-700', tracks: '50' },
  { name: 'RapCaviar', color: 'from-gray-600 to-gray-900', tracks: '50' },
  { name: "Today's Top Hits", color: 'from-rose-500 to-pink-700', tracks: '50' },
];

const SS_SPOTIFY_KEY = 'ss-spotify-user';

function loadStoredUser(): SpotifyUser | null {
  try {
    const raw = sessionStorage.getItem(SS_SPOTIFY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function Spotify() {
  const { playTrack, addToQueue, setActivePlatform, t, userId, userName } = useMusic();
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser | null>(loadStoredUser);
  const [connecting, setConnecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [configMissing, setConfigMissing] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);

  useEffect(() => { setActivePlatform('spotify'); }, [setActivePlatform]);

  const handleAuthMessage = useCallback((e: MessageEvent) => {
    if (e.data?.type === 'spotify-auth-success') {
      const user = e.data.data as SpotifyUser;
      sessionStorage.setItem(SS_SPOTIFY_KEY, JSON.stringify(user));
      setSpotifyUser(user);
      setConnecting(false);
      setAuthError(null);
    } else if (e.data?.type === 'spotify-auth-error') {
      const err = e.data.error as string;
      if (err === 'server_not_configured') {
        setConfigMissing(true);
      } else {
        setAuthError(err === 'access_denied' ? 'Acceso denegado por el usuario.' : `Error: ${err}`);
      }
      setConnecting(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [handleAuthMessage]);

  const connectSpotify = async () => {
    setAuthError(null);
    setConfigMissing(false);
    setConnecting(true);

    try {
      const check = await fetch('/api/auth/spotify/login', { redirect: 'manual' });
      if (check.status === 503) {
        setConfigMissing(true);
        setConnecting(false);
        return;
      }
    } catch {
      setAuthError('No se pudo contactar al servidor.');
      setConnecting(false);
      return;
    }

    const w = 480, h = 640;
    const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - h) / 2);
    const popup = window.open(
      '/api/auth/spotify/login',
      'spotify-auth',
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );
    if (!popup) {
      setAuthError('No se pudo abrir la ventana. Permite los popups en tu navegador.');
      setConnecting(false);
      return;
    }
    const timer = setInterval(() => {
      if (popup.closed) { clearInterval(timer); setConnecting(false); }
    }, 500);
  };

  const disconnect = () => {
    sessionStorage.removeItem(SS_SPOTIFY_KEY);
    setSpotifyUser(null);
  };

  // Play via YouTube backend — full song, no 30s limit, same overlay as YouTube
  const handlePlay = async (track: SpotifyTrack) => {
    setLoadingTrackId(track.id);
    try {
      const res = await fetch(`/api/search/youtube-for-track?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`);
      const data = await res.json();
      if (data.items?.length > 0) {
        const ytItem = data.items[0];
        const ytTrack: Track = {
          id: `sp_${track.id}`,
          type: 'youtube',
          platform: 'spotify',
          title: track.title,
          artist: track.artist,
          thumbnail: track.thumbnail,
          videoId: ytItem.id.videoId,
          addedBy: userId,
          addedByName: userName,
        };
        playTrack(ytTrack);
        setLoadingTrackId(null);
        return;
      }
    } catch {}
    setLoadingTrackId(null);
  };

  const handleAddToQueue = async (track: SpotifyTrack) => {
    try {
      const res = await fetch(`/api/search/youtube-for-track?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`);
      const data = await res.json();
      if (data.items?.length > 0) {
        const ytItem = data.items[0];
        addToQueue({
          id: `sp_${track.id}`,
          type: 'youtube',
          platform: 'spotify',
          title: track.title,
          artist: track.artist,
          thumbnail: track.thumbnail,
          videoId: ytItem.id.videoId,
          addedBy: userId,
          addedByName: userName,
        });
      }
    } catch {}
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#1DB954]/10 flex items-center justify-center border border-[#1DB954]/20 shadow-[0_0_30px_rgba(29,185,84,0.15)]">
          <SiSpotify className="w-7 h-7 text-[#1DB954]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Spotify</h1>
          <p className="text-sm text-muted-foreground">Canciones completas · sin límite de tiempo</p>
        </div>
      </div>

      {/* Connect / Profile banner */}
      {spotifyUser ? (
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/30">
          <div className="flex items-center gap-3">
            {spotifyUser.imageUrl ? (
              <img src={spotifyUser.imageUrl} className="w-10 h-10 rounded-full object-cover border-2 border-[#1DB954]/40" alt="avatar" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-[#1DB954]" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                {spotifyUser.displayName}
                {spotifyUser.isPremium && (
                  <span className="flex items-center gap-0.5 text-[10px] bg-[#1DB954] text-black px-1.5 py-0.5 rounded-full font-bold">
                    <Crown className="w-2.5 h-2.5" /> Premium
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{spotifyUser.isPremium ? 'Cuenta Premium' : 'Cuenta gratuita'}</p>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Desconectar
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/20">
          <div className="flex items-center gap-3">
            <SiSpotify className="w-5 h-5 text-[#1DB954]" />
            <div>
              <p className="text-sm font-semibold">Conectar Spotify</p>
              <p className="text-xs text-muted-foreground">Accede a tu biblioteca, listas y recomendaciones personalizadas</p>
            </div>
          </div>
          <button
            onClick={connectSpotify}
            disabled={connecting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1DB954] text-black text-sm font-bold hover:bg-[#1aa34a] transition-colors disabled:opacity-60"
          >
            {connecting ? 'Conectando…' : 'Conectar'}
          </button>
        </div>
      )}

      {/* Errors */}
      {authError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {authError}
        </div>
      )}
      {configMissing && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 space-y-2">
          <p className="text-sm font-semibold text-yellow-400">Configuración requerida</p>
          <p className="text-xs text-muted-foreground">Agrega en secretos: <code className="bg-muted px-1 rounded text-foreground">SPOTIFY_CLIENT_ID</code> y <code className="bg-muted px-1 rounded text-foreground">SPOTIFY_CLIENT_SECRET</code>.</p>
        </div>
      )}

      {/* Playback info */}
      <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-[#1DB954] flex-shrink-0" />
        Las canciones se reproducen en versión completa vía YouTube · sin restricciones de tiempo
      </div>

      {/* Featured Playlists */}
      <div>
        <h2 className="text-lg font-bold mb-3">{t('featuredPlaylists')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLAYLISTS.map(pl => (
            <div
              key={pl.name}
              className={`aspect-square rounded-xl bg-gradient-to-br ${pl.color} p-5 flex flex-col justify-end cursor-pointer hover:scale-105 transition-transform shadow-lg`}
            >
              <h3 className="font-bold text-white">{pl.name}</h3>
              <p className="text-xs text-white/70">{pl.tracks} tracks</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Tracks */}
      <div>
        <h2 className="text-lg font-bold mb-3">{t('trendingNow')}</h2>
        <div className="space-y-1">
          {FEATURED_TRACKS.map((track, idx) => (
            <div
              key={track.id}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1DB954]/10 border border-transparent hover:border-[#1DB954]/20 transition-all cursor-pointer"
              onClick={() => handlePlay(track)}
            >
              <span className="w-6 text-center text-xs text-muted-foreground group-hover:hidden">{idx + 1}</span>
              {loadingTrackId === track.id ? (
                <Loader2 className="w-4 h-4 text-[#1DB954] animate-spin flex-shrink-0" />
              ) : (
                <Play className="w-4 h-4 text-[#1DB954] hidden group-hover:block flex-shrink-0" />
              )}
              <img src={track.thumbnail} alt={track.album} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground">{track.artist}</p>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); handleAddToQueue(track); }}
                  className="p-1.5 rounded-lg hover:bg-[#1DB954]/20 text-[#1DB954] transition-all"
                  title={t('addToQueue')}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-[#1DB954]/60 px-1">completa</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
