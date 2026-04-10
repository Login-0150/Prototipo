import { Link, useLocation } from "wouter";
import { Home, Radio, ListMusic, History, Settings, Music, DoorOpen } from "lucide-react";
import { SiSpotify, SiYoutube } from "react-icons/si";
import { useMusic } from "../../context/MusicContext";

export default function Sidebar() {
  const [location] = useLocation();
  const { t, currentRoomId, participants } = useMusic();

  const navItems = [
    { key: 'home' as const, href: "/", icon: Home },
    { key: 'spotify' as const, href: "/spotify", icon: SiSpotify, color: "text-[#1DB954]" },
    { key: 'youtube' as const, href: "/youtube", icon: SiYoutube, color: "text-[#FF0000]" },
    { key: 'radio' as const, href: "/radio", icon: Radio, color: "text-[#00C8FF]" },
  ];

  const libraryItems = [
    { key: 'playlists' as const, href: "/playlists", icon: ListMusic },
    { key: 'history' as const, href: "/history", icon: History },
  ];

  return (
    <aside className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col h-full hidden md:flex">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(100,50,255,0.5)]">
          <Music className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
          SoundSync
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Discover */}
        <div className="space-y-0.5">
          <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            {t('discover')}
          </p>
          {navItems.map(item => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group relative ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'}`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />}
                <Icon className={`w-4 h-4 ${isActive && item.color ? item.color : ''}`} />
                <span className="text-sm font-medium">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>

        {/* Library */}
        <div className="space-y-0.5">
          <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            {t('yourLibrary')}
          </p>
          {libraryItems.map(item => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group relative ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'}`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />}
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>

        {/* Rooms */}
        <div className="space-y-0.5">
          <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            {t('rooms')}
          </p>
          <Link
            href="/rooms"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 relative ${location === '/rooms' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'}`}
          >
            {location === '/rooms' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />}
            <DoorOpen className="w-4 h-4" />
            <span className="text-sm font-medium">{t('rooms')}</span>
            {participants.length > 0 && (
              <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                {participants.length}
              </span>
            )}
          </Link>
          <div className="px-3 py-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground truncate">
                {currentRoomId === 'general' ? t('generalRoom') : currentRoomId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-sidebar-border">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 ${location === '/settings' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/40 hover:text-foreground'}`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">{t('settings')}</span>
        </Link>
      </div>
    </aside>
  );
}
