import { useEffect, useState, useCallback } from "react";
import { useMusic, type Track } from "../context/MusicContext";
import { Disc3, Search, Play, Plus, Clock, Music } from "lucide-react";
import { Input } from "../components/ui/input";
import { useLocation } from "wouter";

interface DeezerTrack {
  id: number;
  title: string;
  duration: number;
  artist: { name: string };
  album: { title: string; cover_medium: string };
  preview: string;
}

const FEATURED_QUERIES = ['Bad Bunny', 'The Weeknd', 'Taylor Swift', 'Karol G', 'Drake'];

export default function Deezer() {
  const { playTrack, addToQueue, setActivePlatform, t, userId, userName } = useMusic();
  const [tracks, setTracks] = useState<DeezerTrack[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [location] = useLocation();

  useEffect(() => { setActivePlatform('deezer'); }, [setActivePlatform]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search/deezer?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setTracks(data.data || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const q = params.get('q');
    if (q) { setQuery(q); search(q); }
    else search('top hits 2024');
  }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); search(query); };

  const toTrack = (d: DeezerTrack): Track => ({
    id: `dz_${d.id}`,
    type: 'deezer',
    platform: 'deezer',
    title: d.title,
    artist: d.artist.name,
    thumbnail: d.album.cover_medium,
    duration: d.duration,
    previewUrl: d.preview,
    addedBy: userId,
    addedByName: userName,
  });

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#A238FF]/10 flex items-center justify-center border border-[#A238FF]/20 shadow-[0_0_30px_rgba(162,56,255,0.15)]">
          <Disc3 className="w-7 h-7 text-[#A238FF]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Deezer</h1>
          <p className="text-sm text-muted-foreground">{t('previewOnly')} · {t('explore')}</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`${t('searchFor')} en Deezer...`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9 border-[#A238FF]/20 focus-visible:ring-[#A238FF]/50"
          />
        </div>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#A238FF]/10 hover:bg-[#A238FF]/20 border border-[#A238FF]/30 text-[#A238FF] text-sm font-medium transition-colors">
          {t('searching').replace('...', '')}
        </button>
      </form>

      {/* Quick queries */}
      <div className="flex gap-2 flex-wrap">
        {FEATURED_QUERIES.map(q => (
          <button
            key={q}
            onClick={() => { setQuery(q); search(q); }}
            className="px-3 py-1 rounded-full text-xs bg-[#A238FF]/10 hover:bg-[#A238FF]/20 border border-[#A238FF]/20 text-[#A238FF] transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Tracks */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-card/40 border border-border/30 animate-pulse" />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('noResults')}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-card/60 border border-transparent hover:border-[#A238FF]/20 transition-all cursor-pointer"
              onClick={() => playTrack(toTrack(track))}
            >
              <span className="w-6 text-center text-xs text-muted-foreground group-hover:hidden">{idx + 1}</span>
              <Play className="w-4 h-4 text-[#A238FF] hidden group-hover:block flex-shrink-0" />
              <img src={track.album.cover_medium} alt={track.album.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist.name} · {track.album.title}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); addToQueue(toTrack(track)); }}
                  className="p-1.5 rounded-lg hover:bg-[#A238FF]/20 text-[#A238FF]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTime(track.duration)}</span>
              </div>
              {track.preview && (
                <span className="text-[10px] text-[#A238FF]/60 hidden lg:block">30s</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
