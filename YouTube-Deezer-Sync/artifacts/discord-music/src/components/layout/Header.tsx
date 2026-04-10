import { useState, useRef, useCallback } from "react";
import { Search, Bell, Users, Globe, ChevronDown, X, Play, Plus, Music, Radio } from "lucide-react";
import { Input } from "../ui/input";
import { useMusic, type Track } from "../../context/MusicContext";
import { useLocation } from "wouter";
import { SiYoutube, SiSpotify } from "react-icons/si";
import { Disc3 } from "lucide-react";

function getPlatformIcon(type: string) {
  if (type === 'youtube') return <SiYoutube className="w-3 h-3 text-[#FF0000]" />;
  if (type === 'spotify') return <SiSpotify className="w-3 h-3 text-[#1DB954]" />;
  if (type === 'deezer') return <Disc3 className="w-3 h-3 text-[#A238FF]" />;
  if (type === 'radio') return <Radio className="w-3 h-3 text-[#00C8FF]" />;
  return <Music className="w-3 h-3 text-muted-foreground" />;
}

function formatTime(secs?: number) {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Header() {
  const { participants, language, setLanguage, t, wsStatus, currentRoomId, rooms, playTrack, addToQueue, userId, userName } = useMusic();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const statusColor = wsStatus === 'connected' ? '#22c55e' : wsStatus === 'disconnected' ? '#ef4444' : '#f59e0b';

  const currentRoomName = currentRoomId === 'general' ? t('generalRoom') :
    rooms.find(r => r.id === currentRoomId)?.name || currentRoomId;

  const searchAll = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    setSearchLoading(true);
    setShowSearch(true);
    const results: Track[] = [];

    // Search Deezer (no key needed)
    try {
      const res = await fetch(`/api/search/deezer?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.data?.slice(0, 5) || [];
        items.forEach((item: any) => {
          results.push({
            id: `dz_${item.id}`,
            type: 'deezer',
            platform: 'deezer',
            title: item.title,
            artist: item.artist.name,
            thumbnail: item.album?.cover_medium,
            previewUrl: item.preview,
            duration: item.duration,
            addedBy: userId,
            addedByName: userName,
          });
        });
      }
    } catch {}

    // Search YouTube (if key is configured)
    try {
      const res = await fetch(`/api/search/youtube?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.items?.slice(0, 5) || [];
        items.forEach((item: any) => {
          if (!item.id?.videoId) return;
          results.push({
            id: `yt_${item.id.videoId}`,
            type: 'youtube',
            platform: 'youtube',
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.medium?.url,
            videoId: item.id.videoId,
            addedBy: userId,
            addedByName: userName,
          });
        });
      }
    } catch {}

    setSearchResults(results);
    setSearchLoading(false);
  }, [userId, userName]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    if (!val.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    setShowSearch(true);
    searchTimer.current = setTimeout(() => searchAll(val), 400);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) searchAll(searchQuery.trim());
  };

  const handlePlayResult = (track: Track) => {
    playTrack(track);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleAddResult = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    addToQueue(track);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex-1 max-w-xl relative">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            ref={searchRef}
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-4 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all"
          />
          {searchQuery && (
            <button type="button" onClick={closeSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </form>

        {/* Search Results Dropdown */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            {searchLoading && (
              <div className="px-4 py-3 text-sm text-muted-foreground">{t('searching')}</div>
            )}
            {!searchLoading && searchResults.length === 0 && searchQuery.trim() && (
              <div className="px-4 py-3 text-sm text-muted-foreground">{t('noResults')}</div>
            )}
            {!searchLoading && searchResults.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border/50">
                  {t('searchFor')} "{searchQuery}"
                </div>
                {searchResults.map(track => (
                  <div
                    key={track.id}
                    onClick={() => handlePlayResult(track)}
                    className="group flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border/20 last:border-0"
                  >
                    {track.thumbnail ? (
                      <img src={track.thumbnail} alt={track.title} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.title}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {getPlatformIcon(track.type)}
                        <span className="truncate">{track.artist}</span>
                        {track.duration && <span>· {formatTime(track.duration)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => handleAddResult(e, track)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        title={t('addToQueue')}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handlePlayResult(track)}
                        className="p-1.5 rounded-lg hover:bg-primary/20 text-primary"
                        title={t('play')}
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="px-3 py-2 border-t border-border/50">
                  <button
                    onClick={() => { setLocation(`/deezer?q=${encodeURIComponent(searchQuery)}`); closeSearch(); }}
                    className="text-xs text-primary hover:underline mr-3"
                  >
                    Ver en Deezer →
                  </button>
                  <button
                    onClick={() => { setLocation(`/youtube?q=${encodeURIComponent(searchQuery)}`); closeSearch(); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Ver en YouTube →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-3">
        {/* Language */}
        <div className="relative">
          <button
            onClick={() => { setShowLang(v => !v); setShowParticipants(false); setShowNotif(false); }}
            className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-card/50 hover:bg-card border border-border/50 text-xs font-medium transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{language.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          {showLang && (
            <div className="absolute right-0 top-11 bg-popover border border-border rounded-lg shadow-xl w-32 py-1 z-50">
              {(['en', 'es'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => { setLanguage(lang); setShowLang(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${language === lang ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                >
                  {lang === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Participants / Room */}
        <div className="relative">
          <button
            onClick={() => { setShowParticipants(v => !v); setShowLang(false); setShowNotif(false); }}
            className="flex items-center gap-2 h-9 px-2.5 rounded-lg bg-card/50 hover:bg-card border border-border/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex -space-x-1.5">
              {participants.slice(0, 3).map((p, i) => (
                <div
                  key={p.socketId}
                  className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: p.avatarColor, zIndex: 10 - i }}
                >
                  {p.userName.charAt(0).toUpperCase()}
                </div>
              ))}
              {participants.length === 0 && (
                <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">?</span>
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-muted-foreground hidden sm:block">
              {participants.length} {t('inRoom')}
            </span>
          </button>

          {showParticipants && (
            <div className="absolute right-0 top-11 bg-popover border border-border rounded-xl shadow-xl w-64 p-3 z-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">{currentRoomName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {wsStatus === 'connected' ? '● Conectado' : wsStatus === 'connecting' ? '● Conectando...' : '● Desconectado'}
                  </p>
                </div>
                <button
                  onClick={() => { setLocation('/rooms'); setShowParticipants(false); }}
                  className="text-xs text-primary hover:underline"
                >
                  {t('rooms')}
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {participants.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nadie en la sala aún</p>
                ) : participants.map(p => (
                  <div key={p.socketId} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: p.avatarColor }}>
                      {p.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.userName}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setLocation('/rooms'); setShowParticipants(false); }}
                className="mt-3 w-full py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
              >
                {t('createRoom')} / {t('joinRoom')}
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(v => !v); setShowLang(false); setShowParticipants(false); }}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-card/50 hover:bg-card border border-border/50 transition-colors relative"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
          </button>
          {showNotif && (
            <div className="absolute right-0 top-11 bg-popover border border-border rounded-xl shadow-xl w-64 p-4 z-50">
              <p className="text-sm font-semibold mb-1">Notificaciones</p>
              <p className="text-xs text-muted-foreground">No hay notificaciones nuevas</p>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {(showParticipants || showLang || showNotif || showSearch) && (
        <div className="fixed inset-0 z-30" onClick={() => {
          setShowParticipants(false);
          setShowLang(false);
          setShowNotif(false);
          if (showSearch) closeSearch();
        }} />
      )}
    </header>
  );
}
