import { useEffect, useState, useCallback } from "react";
import { useMusic, type Track } from "../context/MusicContext";
import { SiYoutube } from "react-icons/si";
import { Search, Play, Plus, Clock, AlertCircle } from "lucide-react";
import { Input } from "../components/ui/input";
import { useLocation } from "wouter";

interface YTItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    thumbnails: { medium: { url: string } };
    publishedAt: string;
  };
}

const TRENDING_QUERIES = ['Top Hits 2024', 'Reggaeton 2024', 'Pop Latino', 'Musica Electronica', 'Lo Fi Hip Hop'];

export default function YouTube() {
  const { playTrack, addToQueue, setActivePlatform, t, userId, userName } = useMusic();
  const [results, setResults] = useState<YTItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [noKey, setNoKey] = useState(false);
  const [location] = useLocation();

  useEffect(() => { setActivePlatform('youtube'); }, [setActivePlatform]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setNoKey(false);
    try {
      const res = await fetch(`/api/search/youtube?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.status === 503 || data.error?.includes('not configured')) {
        setNoKey(true);
      } else if (data.items) {
        setResults(data.items);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const q = params.get('q');
    if (q) { setQuery(q); search(q); }
    else search('top music 2024');
  }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); search(query); };

  const toTrack = (item: YTItem): Track => ({
    id: `yt_${item.id.videoId}`,
    type: 'youtube',
    platform: 'youtube',
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium.url,
    videoId: item.id.videoId,
    addedBy: userId,
    addedByName: userName,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FF0000]/10 flex items-center justify-center border border-[#FF0000]/20 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
          <SiYoutube className="w-7 h-7 text-[#FF0000]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">YouTube Music</h1>
          <p className="text-sm text-muted-foreground">Videos y audio oficial</p>
        </div>
      </div>

      {noKey && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-500">YouTube API Key requerida</p>
            <p className="text-xs text-muted-foreground mt-1">
              Para buscar en YouTube necesitas una clave de la API de YouTube Data v3 (gratuita).
              Agrégala en Settings como <code className="bg-muted px-1 rounded">YOUTUBE_API_KEY</code> en el panel de secretos de Replit.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar videos de música en YouTube..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9 border-[#FF0000]/20 focus-visible:ring-[#FF0000]/40"
          />
        </div>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/30 text-[#FF0000] text-sm font-medium transition-colors">
          Buscar
        </button>
      </form>

      <div className="flex gap-2 flex-wrap">
        {TRENDING_QUERIES.map(q => (
          <button
            key={q}
            onClick={() => { setQuery(q); search(q); }}
            className="px-3 py-1 rounded-full text-xs bg-[#FF0000]/10 hover:bg-[#FF0000]/20 border border-[#FF0000]/20 text-[#FF0000] transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card/40 border border-border/30 animate-pulse">
              <div className="aspect-video bg-muted/50 rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-muted/50 rounded w-3/4" />
                <div className="h-2 bg-muted/30 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 && !noKey ? (
        <div className="text-center py-16 text-muted-foreground">
          <SiYoutube className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map(item => (
            <div
              key={item.id.videoId}
              className="group rounded-xl bg-card/40 border border-border/30 hover:border-[#FF0000]/30 hover:bg-card/70 transition-all cursor-pointer overflow-hidden"
              onClick={() => playTrack(toTrack(item))}
            >
              <div className="relative aspect-video">
                <img
                  src={item.snippet.thumbnails.medium.url}
                  alt={item.snippet.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 leading-tight">{item.snippet.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.snippet.channelTitle}</p>
              </div>
              <div className="px-3 pb-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); addToQueue(toTrack(item)); }}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-card text-xs hover:bg-muted transition-colors"
                >
                  <Plus className="w-3 h-3" /> Cola
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
