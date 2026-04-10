import { useState } from "react";
import { useMusic } from "../context/MusicContext";
import { Settings as SettingsIcon, Globe, User, Wifi } from "lucide-react";
import { SiSpotify, SiYoutube } from "react-icons/si";
import { Input } from "../components/ui/input";

const SS_SPOTIFY_KEY = 'ss-spotify-user';

function getSpotifyConnectionStatus(): { connected: boolean; displayName?: string } {
  try {
    const raw = sessionStorage.getItem(SS_SPOTIFY_KEY);
    if (!raw) return { connected: false };
    const user = JSON.parse(raw);
    return { connected: true, displayName: user.displayName };
  } catch {
    return { connected: false };
  }
}

export default function SettingsPage() {
  const { t, language, setLanguage, userName, setUserName, wsStatus } = useMusic();
  const [nameInput, setNameInput] = useState(userName);

  const wsColor = wsStatus === 'connected' ? 'text-green-500' : wsStatus === 'disconnected' ? 'text-red-500' : 'text-yellow-500';
  const wsLabel = wsStatus === 'connected' ? 'Conectado' : wsStatus === 'disconnected' ? 'Desconectado' : 'Conectando...';

  const spotifyStatus = getSpotifyConnectionStatus();

  const handleNameSave = () => {
    if (nameInput.trim()) setUserName(nameInput.trim());
  };

  return (
    <div className="space-y-6 max-w-xl animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <SettingsIcon className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('settings')}</h1>
          <p className="text-sm text-muted-foreground">Configuración de SoundSync</p>
        </div>
      </div>

      {/* Language */}
      <div className="bg-card/40 border border-border/30 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          {t('language')}
        </h2>
        <div className="flex gap-2">
          {(['en', 'es'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${language === lang ? 'bg-primary border-primary text-white' : 'border-border bg-card/50 text-muted-foreground hover:border-primary/40'}`}
            >
              {lang === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
            </button>
          ))}
        </div>
      </div>

      {/* Profile */}
      <div className="bg-card/40 border border-border/30 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Tu Perfil
        </h2>
        <div className="flex gap-2">
          <Input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleNameSave()}
            placeholder="Tu nombre de usuario"
          />
          <button
            onClick={handleNameSave}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Guardar
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Este nombre aparece en las salas y al añadir canciones.</p>
      </div>

      {/* Connection status */}
      <div className="bg-card/40 border border-border/30 rounded-xl p-5 space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Wifi className="w-4 h-4 text-primary" />
          Conexión en Tiempo Real
        </h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full animate-pulse ${wsStatus === 'connected' ? 'bg-green-500' : wsStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'}`} />
          <span className={`text-sm font-medium ${wsColor}`}>{wsLabel}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Las salas en tiempo real usan WebSocket. Si estás desconectado, recarga la página.
        </p>
      </div>

      {/* API Keys / Accounts */}
      <div className="bg-card/40 border border-border/30 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold">{t('connectedAccounts')}</h2>

        <div className="space-y-3">
          {/* Spotify */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SiSpotify className="w-4 h-4" style={{ color: '#1DB954' }} />
              <span className="text-sm font-medium">Spotify</span>
            </div>
            {spotifyStatus.connected ? (
              <span className="text-xs text-green-500 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                ✓ {spotifyStatus.displayName || 'Conectado'}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-card rounded-full border border-border/50">
                No conectado
              </span>
            )}
          </div>

          {/* YouTube */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SiYoutube className="w-4 h-4" style={{ color: '#FF0000' }} />
              <span className="text-sm font-medium">YouTube</span>
            </div>
            <span className="text-xs text-green-500 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
              ✓ API conectada
            </span>
          </div>

          {/* Radio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span>📻</span>
              <span className="text-sm font-medium">Radio</span>
            </div>
            <span className="text-xs text-green-500 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
              ✓ Activo
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-border/30 space-y-2">
          <p className="text-xs text-muted-foreground">
            Para conectar Spotify con OAuth, agrega <code className="bg-muted px-1 rounded">SPOTIFY_CLIENT_ID</code> y <code className="bg-muted px-1 rounded">SPOTIFY_CLIENT_SECRET</code> en los secretos del proyecto.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Sin conexión OAuth, los tracks de Spotify se reproducen vía reproductor embebido (requiere sesión activa en Spotify en el navegador).
          </p>
        </div>
      </div>
    </div>
  );
}
