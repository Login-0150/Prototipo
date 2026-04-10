import { useEffect, useState, useCallback } from "react";
import { useMusic, type Track } from "../context/MusicContext";
import { Radio, Globe2, Play, Signal, Users } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface RadioStation {
  stationuuid: string;
  name: string;
  country: string;
  countrycode: string;
  tags: string;
  url_resolved: string;
  favicon: string;
  votes: number;
  clickcount: number;
  bitrate: number;
}

const GENRES = [
  'Pop', 'Rock', 'Jazz', 'Electronic', 'Classical', 'Hip-Hop', 'Latin',
  'Reggaeton', 'R&B', 'Soul', 'Blues', 'Country', 'Metal', 'Salsa',
  'Cumbia', 'Trap', 'Indie', 'Dance', 'House', 'Techno', 'Ambient', 'News',
];

const COUNTRIES = [
  { code: '', name: 'Todo el mundo' },
  { code: 'US', name: '🇺🇸 Estados Unidos' },
  { code: 'ES', name: '🇪🇸 España' },
  { code: 'MX', name: '🇲🇽 México' },
  { code: 'AR', name: '🇦🇷 Argentina' },
  { code: 'CO', name: '🇨🇴 Colombia' },
  { code: 'CL', name: '🇨🇱 Chile' },
  { code: 'PE', name: '🇵🇪 Perú' },
  { code: 'VE', name: '🇻🇪 Venezuela' },
  { code: 'BR', name: '🇧🇷 Brasil' },
  { code: 'GB', name: '🇬🇧 Reino Unido' },
  { code: 'DE', name: '🇩🇪 Alemania' },
  { code: 'FR', name: '🇫🇷 Francia' },
  { code: 'IT', name: '🇮🇹 Italia' },
  { code: 'JP', name: '🇯🇵 Japón' },
  { code: 'KR', name: '🇰🇷 Corea del Sur' },
  { code: 'CA', name: '🇨🇦 Canadá' },
  { code: 'AU', name: '🇦🇺 Australia' },
  { code: 'RU', name: '🇷🇺 Rusia' },
  { code: 'TR', name: '🇹🇷 Turquía' },
];

export default function RadioPage() {
  const { playTrack, addToQueue, setActivePlatform, t, userId, userName } = useMusic();
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [genre, setGenre] = useState("");

  const fetchStations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '80' });
      if (search) params.set('name', search);
      if (country) params.set('country', country);
      if (genre) params.set('genre', genre.toLowerCase());
      const res = await fetch(`/api/search/radio?${params}`);
      if (res.ok) {
        const data: RadioStation[] = await res.json();
        setStations(data.filter(s => s.url_resolved));
      }
    } catch {}
    setLoading(false);
  }, [search, country, genre]);

  useEffect(() => { setActivePlatform('radio'); }, [setActivePlatform]);
  useEffect(() => { fetchStations(); }, [country, genre]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchStations(); };

  const toTrack = (s: RadioStation): Track => ({
    id: s.stationuuid,
    type: 'radio',
    platform: 'radio',
    title: s.name,
    artist: s.country || s.countrycode,
    thumbnail: s.favicon || undefined,
    streamUrl: s.url_resolved,
    isLive: true,
    addedBy: userId,
    addedByName: userName,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00C8FF]/10 flex items-center justify-center border border-[#00C8FF]/20 shadow-[0_0_30px_rgba(0,200,255,0.15)]">
            <Radio className="w-7 h-7 text-[#00C8FF]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('liveRadio')}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5" /> {t('radioStations')} · radio-browser.info
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <Input
          placeholder={t('searchStations')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border-[#00C8FF]/20 focus-visible:ring-[#00C8FF]/50"
        />
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground"
        >
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground"
        >
          <option value="">{t('allGenres')}</option>
          {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <Button type="submit" variant="outline" className="border-[#00C8FF]/30 text-[#00C8FF] hover:bg-[#00C8FF]/10">
          Buscar
        </Button>
      </form>

      {/* Stations count */}
      {!loading && stations.length > 0 && (
        <p className="text-xs text-muted-foreground">{stations.length} estaciones encontradas</p>
      )}

      {/* Stations grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-card/40 border border-border/30 animate-pulse" />
          ))}
        </div>
      ) : stations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Radio className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('noResults')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stations.map(station => (
            <div
              key={station.stationuuid}
              className="group relative flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-border/30 hover:border-[#00C8FF]/30 hover:bg-card/70 transition-all cursor-pointer"
              onClick={() => playTrack(toTrack(station))}
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#00C8FF]/10 flex-shrink-0 flex items-center justify-center">
                {station.favicon ? (
                  <img
                    src={station.favicon}
                    alt={station.name}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <Radio className="w-5 h-5 text-[#00C8FF]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-[#00C8FF] transition-colors">{station.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{station.country || station.countrycode}</span>
                  {station.bitrate > 0 && <><span>·</span><Signal className="w-3 h-3" /><span>{station.bitrate}kbps</span></>}
                  {station.clickcount > 0 && <><span>·</span><Users className="w-3 h-3" /><span>{station.clickcount.toLocaleString()}</span></>}
                </div>
                {station.tags && (
                  <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{station.tags.split(',').slice(0, 3).join(', ')}</p>
                )}
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {t('liveLabel')}
                </span>
              </div>
              <div className="flex-col gap-1 items-center hidden group-hover:flex flex-shrink-0 ml-1">
                <div className="w-8 h-8 rounded-full bg-[#00C8FF] flex items-center justify-center shadow-lg">
                  <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                </div>
                <button
                  onClick={e => { e.stopPropagation(); addToQueue(toTrack(station)); }}
                  className="text-[10px] text-muted-foreground hover:text-[#00C8FF] transition-colors"
                >
                  + Cola
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
