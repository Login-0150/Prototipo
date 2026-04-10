import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, ListMusic, ThumbsDown, RotateCcw, RotateCw, Crown } from "lucide-react";
import { SiSpotify, SiYoutube } from "react-icons/si";
import { Radio } from "lucide-react";
import { Slider } from "../ui/slider";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import { useMusic } from "../../context/MusicContext";

export default function PlayerOverlay() {
  const {
    currentTrack, playbackState, pause, resume, next, previous,
    volume, setVolume, toggleMute, isMuted, skipVotes, participants,
    voteSkip, canControl, shuffle, repeat, toggleShuffle, toggleRepeat,
    position, duration, seek, t, userId, isHost,
  } = useMusic();

  const [showQueue, setShowQueue] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Use platform for icon display (Spotify tracks played via YouTube still show Spotify icon)
  const displayPlatform = currentTrack.platform || currentTrack.type;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'spotify': return <SiSpotify className="w-3.5 h-3.5 text-[#1DB954]" />;
      case 'youtube': return <SiYoutube className="w-3.5 h-3.5 text-[#FF0000]" />;
      case 'radio': return <Radio className="w-3.5 h-3.5 text-[#00C8FF]" />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'spotify': return '#1DB954';
      case 'youtube': return '#FF0000';
      case 'radio': return '#00C8FF';
      default: return '#6432FF';
    }
  };

  const accentColor = getPlatformColor(displayPlatform);
  const isOwner = currentTrack.addedBy === userId;
  const showOwnerControls = canControl;
  const isLive = currentTrack.isLive;
  const effectiveDuration = duration || currentTrack.duration || 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-24 bg-card/98 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-between px-3 md:px-5"
      style={{ boxShadow: `0 -1px 0 0 ${accentColor}22, 0 -10px 30px -10px rgba(0,0,0,0.6)` }}
    >
      {/* Subtle platform glow */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }} />

      {/* Left: Track Info */}
      <div className="flex items-center gap-3 w-[30%] min-w-0 relative z-10">
        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0 shadow-md">
          {currentTrack.thumbnail ? (
            <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}22` }}>
              {getPlatformIcon(displayPlatform)}
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {getPlatformIcon(displayPlatform)}
            {isOwner && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Crown className="w-3 h-3 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent><p>{t('youAdded')}</p></TooltipContent>
              </Tooltip>
            )}
            {isHost && !isOwner && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Crown className="w-3 h-3 text-primary" />
                </TooltipTrigger>
                <TooltipContent><p>{t('hostLabel')}</p></TooltipContent>
              </Tooltip>
            )}
          </div>
          <span className="font-semibold text-sm truncate">{currentTrack.title}</span>
          <span className="text-xs text-muted-foreground truncate">{currentTrack.artist}</span>
        </div>
      </div>

      {/* Center: Controls + Progress */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5 max-w-xl px-3 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {showOwnerControls ? (
            <button onClick={previous} className="text-muted-foreground hover:text-foreground transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button disabled className="text-muted-foreground opacity-50 cursor-not-allowed">
              <SkipBack className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={playbackState === 'playing' ? pause : resume}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            {playbackState === 'playing'
              ? <Pause className="w-4 h-4 fill-current" />
              : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {showOwnerControls ? (
            <button onClick={next} className="text-muted-foreground hover:text-foreground transition-colors">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button disabled className="text-muted-foreground opacity-50 cursor-not-allowed">
              <SkipForward className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={toggleRepeat}
            className={`transition-colors ${repeat ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Progress / Live indicator */}
        {isLive ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {t('liveLabel')}
            </span>
          </div>
        ) : showOwnerControls ? (
          <div className="flex items-center gap-2 w-full text-xs">
            <button onClick={() => seek(Math.max(0, position - 10))} className="text-muted-foreground hover:text-foreground">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-right text-muted-foreground">{formatTime(position)}</span>
            <div className="flex-1 group">
              <Slider
                value={[position]}
                max={effectiveDuration || 100}
                step={1}
                onValueChange={v => seek(v[0])}
                className="w-full cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-md [&_[role=slider]]:opacity-0 group-hover:[&_[role=slider]]:opacity-100"
              />
            </div>
            <span className="w-9 text-muted-foreground">{formatTime(effectiveDuration)}</span>
            <button onClick={() => seek(Math.min(effectiveDuration, position + 10))} className="text-muted-foreground hover:text-foreground">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full text-xs">
            <span className="w-9 text-right text-muted-foreground">{formatTime(position)}</span>
            <div className="flex-1">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${effectiveDuration ? (position / effectiveDuration) * 100 : 0}%`, backgroundColor: accentColor }}
                />
              </div>
            </div>
            <span className="w-9 text-muted-foreground">{formatTime(effectiveDuration)}</span>
          </div>
        )}
      </div>

      {/* Right: Volume + Skip */}
      <div className="flex items-center justify-end gap-3 w-[30%] relative z-10">
        {!showOwnerControls && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={voteSkip}
                className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ThumbsDown className="w-3 h-3" />
                <span>{skipVotes.length}/{Math.max(1, Math.ceil(participants.length / 2))}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent><p>{t('voteSkip')}</p></TooltipContent>
          </Tooltip>
        )}

        <button onClick={() => setShowQueue(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ListMusic className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 w-24 group">
          <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            step={1}
            onValueChange={v => { setVolume(v[0]); }}
            className="w-full cursor-pointer [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-md [&_[role=slider]]:opacity-0 group-hover:[&_[role=slider]]:opacity-100"
          />
        </div>
      </div>

      {/* Added-by label */}
      {!showOwnerControls && currentTrack.addedBy && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60">
          {t('addedBy')}: {currentTrack.addedByName}
        </div>
      )}
    </div>
  );
}
