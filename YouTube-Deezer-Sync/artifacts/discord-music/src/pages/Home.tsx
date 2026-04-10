import { useEffect } from "react";
import { useMusic, type Track } from "../context/MusicContext";
import { Play, Radio, TrendingUp, Users, Zap } from "lucide-react";
import { SiSpotify, SiYoutube } from "react-icons/si";
import { Link } from "wouter";

const SAMPLE_TRACKS: Track[] = [
  { id: 'yt1', type: 'youtube', platform: 'youtube', title: 'Blinding Lights', artist: 'The Weeknd', thumbnail: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', videoId: 'fHI8X4OXluQ', addedBy: 'system', addedByName: 'SoundSync' },
  { id: 'yt2', type: 'youtube', platform: 'youtube', title: 'As It Was', artist: 'Harry Styles', thumbnail: 'https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14', videoId: 'H5v3kku4y6Q', addedBy: 'system', addedByName: 'SoundSync' },
  { id: 'yt3', type: 'youtube', platform: 'youtube', title: 'Flowers', artist: 'Miley Cyrus', thumbnail: 'https://i.scdn.co/image/ab67616d0000b273f429549123dbe8552764ba1d', videoId: 'G7KNmW9a75Y', addedBy: 'system', addedByName: 'SoundSync' },
  { id: 'yt4', type: 'youtube', platform: 'youtube', title: 'Anti-Hero', artist: 'Taylor Swift', thumbnail: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5', videoId: 'b1kbLwvqugk', addedBy: 'system', addedByName: 'SoundSync' },
];

const PLATFORM_KEYS = [
  { nameKey: 'spotify' as const, descKey: 'platformDescSpotify' as const, href: '/spotify', icon: SiSpotify, color: '#1DB954', bg: 'from-[#1DB954]/20 to-transparent' },
  { nameKey: 'youtube' as const, descKey: 'platformDescYouTube' as const, href: '/youtube', icon: SiYoutube, color: '#FF0000', bg: 'from-[#FF0000]/20 to-transparent' },
  { nameKey: 'radio' as const, descKey: 'platformDescRadio' as const, href: '/radio', icon: Radio, color: '#00C8FF', bg: 'from-[#00C8FF]/20 to-transparent' },
];

export default function Home() {
  const { setActivePlatform, playTrack, addToQueue, participants, currentRoomId, t, userId, userName } = useMusic();

  useEffect(() => { setActivePlatform('all'); }, [setActivePlatform]);

  const handlePlay = (track: Track) => {
    playTrack({ ...track, addedBy: userId, addedByName: userName });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Banner */}
      <section className="relative w-full h-[260px] rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-xs font-bold text-primary mb-3 backdrop-blur-md uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t('featuredSession')}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-white">Late Night Vibes</h1>
          <p className="text-base text-white/70 mb-5 max-w-md">Synthwave, ambient y deep house. Perfecto para la noche.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePlay(SAMPLE_TRACKS[0])}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              {t('listenNow')}
            </button>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Users className="w-4 h-4" />
              <span>{participants.length} {t('inRoom')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Quick Access */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Plataformas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PLATFORM_KEYS.map(p => {
            const Icon = p.icon;
            return (
              <Link key={p.nameKey} href={p.href}>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${p.bg} border border-white/5 hover:border-white/10 transition-all cursor-pointer hover:scale-[1.02] group`}>
                  <Icon className="w-6 h-6 mb-2" style={{ color: p.color }} />
                  <p className="font-semibold text-sm">{t(p.nameKey)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t(p.descKey)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending + Room Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending tracks */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t('trendingNow')}
          </h2>
          <div className="space-y-1">
            {SAMPLE_TRACKS.map((track, idx) => (
              <div
                key={track.id}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-card/60 border border-transparent hover:border-border/30 transition-all cursor-pointer"
                onClick={() => handlePlay(track)}
              >
                <span className="w-6 text-center text-sm text-muted-foreground group-hover:hidden">{idx + 1}</span>
                <Play className="w-4 h-4 text-primary hidden group-hover:block flex-shrink-0" />
                <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); addToQueue({ ...track, addedBy: userId, addedByName: userName }); }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-primary transition-all px-2 py-1 rounded"
                >
                  + {t('queue')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Room Panel */}
        <div className="space-y-4">
          <div className="bg-card/40 border border-border/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {currentRoomId === 'general' ? t('generalRoom') : currentRoomId}
              </h3>
              <Link href="/rooms">
                <span className="text-xs text-primary hover:underline cursor-pointer">{t('rooms')}</span>
              </Link>
            </div>
            {participants.length === 0 ? (
              <p className="text-xs text-muted-foreground">Conectando...</p>
            ) : (
              <div className="space-y-2">
                {participants.slice(0, 5).map(p => (
                  <div key={p.socketId} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: p.avatarColor }}>
                      {p.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-muted-foreground">{p.userName}</span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/rooms">
              <div className="mt-3 w-full py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium text-center transition-colors cursor-pointer">
                {t('createRoom')}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
