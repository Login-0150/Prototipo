import { useEffect } from "react";
import { useMusic } from "../context/MusicContext";
import TrackList from "../components/shared/TrackList";
import { ListMusic, Play } from "lucide-react";

export default function Playlists() {
  const { setActivePlatform, playlists, playTrack, t } = useMusic();

  useEffect(() => {
    setActivePlatform('all');
  }, [setActivePlatform]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(100,50,255,0.15)]">
          <ListMusic className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('playlists')}</h1>
          <p className="text-muted-foreground text-sm">Tus colecciones de música de todas las plataformas.</p>
        </div>
      </div>

      <div className="space-y-8">
        {playlists.map(playlist => (
          <div key={playlist.id} className="bg-card/30 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold">{playlist.name}</h2>
                <p className="text-sm text-muted-foreground">{playlist.tracks.length} tracks</p>
              </div>
              <button
                onClick={() => { if (playlist.tracks.length > 0) playTrack(playlist.tracks[0]); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-white transition-colors text-sm font-medium"
              >
                <Play className="w-4 h-4 fill-current" />
                {t('play')}
              </button>
            </div>

            {playlist.tracks.length > 0 ? (
              <TrackList tracks={playlist.tracks} />
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                No hay tracks en esta lista. ¡Explora las plataformas para añadir música!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
