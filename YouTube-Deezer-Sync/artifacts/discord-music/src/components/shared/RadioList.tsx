import { Play, Radio } from "lucide-react";
import { type Track } from "../../context/MusicContext";
import { useMusic } from "../../context/MusicContext";

interface RadioListProps {
  stations: Track[];
  title?: string;
}

export default function RadioList({ stations, title }: RadioListProps) {
  const { currentTrack, playTrack } = useMusic();

  return (
    <div className="w-full">
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((station) => {
          const isPlaying = currentTrack?.id === station.id;

          return (
            <div
              key={station.id}
              className={`group flex items-center p-4 rounded-xl transition-all duration-300 ${isPlaying ? 'bg-card border-2 border-[#00C8FF]/50 shadow-[0_0_20px_rgba(0,200,255,0.15)]' : 'bg-card/40 border border-white/5 hover:bg-card hover:border-white/10'}`}
            >
              <div className="relative w-14 h-14 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                {station.thumbnail ? (
                  <img src={station.thumbnail} alt={station.title} className="w-full h-full object-cover" />
                ) : (
                  <Radio className="w-5 h-5 text-[#00C8FF]" />
                )}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity ${isPlaying ? 'opacity-100 bg-[#00C8FF]/20' : 'group-hover:opacity-100'}`}>
                  <button
                    onClick={() => playTrack(station)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${isPlaying ? 'bg-[#00C8FF] text-black' : 'bg-white text-black'}`}
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <h3 className={`font-bold truncate text-sm ${isPlaying ? 'text-[#00C8FF]' : 'text-foreground'}`}>
                  {station.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{station.artist}</p>
                {isPlaying && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-400">EN VIVO</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
