import { useEffect } from "react";
import { useMusic } from "../context/MusicContext";
import TrackList from "../components/shared/TrackList";
import { History as HistoryIcon, Music } from "lucide-react";

export default function History() {
  const { setActivePlatform, history, t } = useMusic();

  useEffect(() => {
    setActivePlatform('all');
  }, [setActivePlatform]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center">
          <HistoryIcon className="w-7 h-7 text-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('history')}</h1>
          <p className="text-muted-foreground text-sm">Tracks reproducidos en esta sesión.</p>
        </div>
      </div>

      <div className="bg-card/30 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
        {history.length > 0 ? (
          <TrackList tracks={history} />
        ) : (
          <div className="text-center py-12 text-muted-foreground space-y-3">
            <Music className="w-12 h-12 mx-auto opacity-20" />
            <p>No hay historial todavía. ¡Reproduce algo de música!</p>
          </div>
        )}
      </div>
    </div>
  );
}
