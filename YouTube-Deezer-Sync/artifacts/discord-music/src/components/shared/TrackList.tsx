import { Play, Plus, MoreHorizontal } from "lucide-react";
import { type Track } from "../../context/MusicContext";
import { useMusic } from "../../context/MusicContext";
import { SiSpotify, SiYoutube } from "react-icons/si";
import { Radio, Disc3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface TrackListProps {
  tracks: Track[];
  title?: string;
  showPlatform?: boolean;
}

export default function TrackList({ tracks, title, showPlatform = true }: TrackListProps) {
  const { currentTrack, playTrack, addToQueue, playlists, saveToPlaylist } = useMusic();

  const formatTime = (seconds?: number) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'spotify': return <SiSpotify className="w-4 h-4 text-[#1DB954]" />;
      case 'youtube': return <SiYoutube className="w-4 h-4 text-[#FF0000]" />;
      case 'deezer': return <Disc3 className="w-4 h-4 text-[#A238FF]" />;
      case 'radio': return <Radio className="w-4 h-4 text-[#00C8FF]" />;
      default: return null;
    }
  };

  return (
    <div className="w-full">
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <div className="space-y-1">
        {tracks.map((track, idx) => {
          const isPlaying = currentTrack?.id === track.id;
          return (
            <div
              key={`${track.id}-${idx}`}
              className={`group flex items-center justify-between p-3 rounded-xl hover:bg-card/60 transition-colors ${isPlaying ? 'bg-card/50 border border-primary/20' : 'border border-transparent'}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-6 text-center text-xs font-medium text-muted-foreground group-hover:hidden">
                  {isPlaying ? (
                    <div className="flex items-end justify-center gap-0.5 h-4">
                      <div className="w-0.5 h-3 bg-primary animate-pulse" />
                      <div className="w-0.5 h-4 bg-primary animate-pulse delay-100" />
                      <div className="w-0.5 h-2 bg-primary animate-pulse delay-200" />
                    </div>
                  ) : (idx + 1)}
                </div>
                <button
                  onClick={() => playTrack(track)}
                  className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center hidden group-hover:flex hover:bg-primary hover:text-white transition-colors flex-shrink-0"
                >
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </button>

                {track.thumbnail ? (
                  <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                    {getPlatformIcon(track.platform)}
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-medium truncate ${isPlaying ? 'text-primary' : ''}`}>{track.title}</span>
                  <span className="text-xs text-muted-foreground truncate">{track.artist}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => addToQueue(track)}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                    <DropdownMenuLabel>Guardar en Lista</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {playlists.map(pl => (
                      <DropdownMenuItem
                        key={pl.id}
                        onClick={() => saveToPlaylist(track, pl.id)}
                        className="cursor-pointer"
                      >
                        {pl.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-3 justify-end text-xs text-muted-foreground ml-2">
                {showPlatform && getPlatformIcon(track.platform)}
                {track.duration && <span>{formatTime(track.duration)}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
