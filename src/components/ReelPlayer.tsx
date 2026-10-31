import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music } from "lucide-react";
import { BeatItem } from "../data/scriptData";
import { sfx } from "../utils/narratorAudio";

interface ReelPlayerProps {
  beats: BeatItem[];
}

// Precise word timestamp map for sync with the natural voiceover
const WORD_TIMESTAMPS = [
  // Beat 1 (0.0s - 4.87s) - Almost everyone drinks Iced Americano
  { text: "Almost", start: 0.0, end: 0.45, beat: 0, line: 0 },
  { text: "everyone", start: 0.45, end: 1.05, beat: 0, line: 0 },
  { text: "drinks", start: 1.05, end: 1.55, beat: 0, line: 0 },
  { text: "“아이스", start: 1.55, end: 2.15, beat: 0, line: 0 },
  { text: "아메리카노”—", start: 2.15, end: 2.85, beat: 0, line: 0 },
  { text: "that’s", start: 2.85, end: 3.25, beat: 0, line: 1 },
  { text: "Iced", start: 3.25, end: 3.65, beat: 0, line: 1 },
  { text: "Americano!", start: 3.65, end: 4.15, beat: 0, line: 1 },
  { text: "So", start: 4.15, end: 4.45, beat: 0, line: 1 },
  { text: "refreshing.", start: 4.45, end: 4.87, beat: 0, line: 1 },

  // Beat 2 (4.87s - 9.27s) - Cafes on every corner, always served, cheapest
  { text: "With", start: 4.87, end: 5.15, beat: 1, line: 0 },
  { text: "cafes", start: 5.15, end: 5.55, beat: 1, line: 0 },
  { text: "on", start: 5.55, end: 5.75, beat: 1, line: 0 },
  { text: "every", start: 5.75, end: 6.15, beat: 1, line: 0 },
  { text: "corner,", start: 6.15, end: 6.7, beat: 1, line: 0 },
  { text: "it’s", start: 6.7, end: 7.0, beat: 1, line: 0 },
  { text: "always", start: 7.0, end: 7.45, beat: 1, line: 0 },
  { text: "served—", start: 7.45, end: 7.95, beat: 1, line: 0 },
  { text: "and", start: 7.95, end: 8.2, beat: 1, line: 1 },
  { text: "usually", start: 8.2, end: 8.65, beat: 1, line: 1 },
  { text: "the", start: 8.65, end: 8.85, beat: 1, line: 1 },
  { text: "cheapest!", start: 8.85, end: 9.27, beat: 1, line: 1 },

  // Beat 3 (9.27s - 13.58s) - Koreans drink it even in freezing winter (no "That's why")
  { text: "Koreans", start: 9.27, end: 9.85, beat: 2, line: 0 },
  { text: "drink", start: 9.85, end: 10.25, beat: 2, line: 0 },
  { text: "it", start: 10.25, end: 10.5, beat: 2, line: 0 },
  { text: "all", start: 10.5, end: 10.85, beat: 2, line: 0 },
  { text: "year", start: 10.85, end: 11.25, beat: 2, line: 0 },
  { text: "round—", start: 11.25, end: 11.85, beat: 2, line: 0 },
  { text: "even", start: 11.85, end: 12.3, beat: 2, line: 1 },
  { text: "in", start: 12.3, end: 12.6, beat: 2, line: 1 },
  { text: "freezing", start: 12.6, end: 13.1, beat: 2, line: 1 },
  { text: "winter!", start: 13.1, end: 13.58, beat: 2, line: 1 },
];

export const ReelPlayer: React.FC<ReelPlayerProps> = ({ beats }) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [controlsHovered, setControlsHovered] = useState<boolean>(false);
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(0.06); // Default 6% - very quiet and gentle

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const tickerRef = useRef<number | null>(null);
  const lastBeatRef = useRef<number>(-1);

  // Initialize and preload master natural neural audio + soft background jazz music
  useEffect(() => {
    const audio = new Audio("/audio/master_15s_voiceover.wav");
    audio.preload = "auto";
    audioRef.current = audio;

    const bgMusic = new Audio("/assets/aistudio/the_mountain-easy-jazz-618215__1__dc50bca9.mp3");
    bgMusic.preload = "auto";
    bgMusic.loop = true;
    bgMusic.volume = bgMusicVolume;
    bgMusicRef.current = bgMusic;

    return () => {
      audio.pause();
      bgMusic.pause();
    };
  }, []);

  // Synchronize background music volume dynamically
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = bgMusicVolume;
    }
  }, [bgMusicVolume]);

  // Synchronize audio volume / mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Master timer ticker for 15s reel
  useEffect(() => {
    if (isPlaying) {
      const stepMs = 50;
      tickerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 15.0) {
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.pause();
            if (bgMusicRef.current) bgMusicRef.current.pause();
            return 15.0;
          }
          return Math.min(15.0, prev + stepMs / 1000);
        });
      }, stepMs);
    } else {
      if (tickerRef.current) clearInterval(tickerRef.current);
    }

    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [isPlaying]);

  // Sync audio with play/pause and time updates
  useEffect(() => {
    const audio = audioRef.current;
    const bgMusic = bgMusicRef.current;

    if (isPlaying) {
      if (audio) {
        if (Math.abs(audio.currentTime - currentTime) > 0.25) {
          audio.currentTime = Math.min(currentTime, audio.duration || 14.5);
        }
        audio.play().catch((err) => console.warn("Audio play prevented", err));
      }
      if (bgMusic) {
        bgMusic.play().catch((err) => console.warn("BG music play prevented", err));
      }
    } else {
      if (audio) audio.pause();
      if (bgMusic) bgMusic.pause();
    }
  }, [isPlaying]);

  // Current active beat index
  const activeBeatIndex = beats.findIndex(
    (b) => currentTime >= b.startSec && currentTime < b.endSec
  );
  const safeBeatIdx = activeBeatIndex !== -1 ? activeBeatIndex : 0;

  // Sound effects on beat transition
  useEffect(() => {
    if (isPlaying && activeBeatIndex !== -1 && activeBeatIndex !== lastBeatRef.current) {
      lastBeatRef.current = activeBeatIndex;
      if (!isMuted) {
        if (activeBeatIndex === 0) sfx.playIceClink();
        else if (activeBeatIndex === 1) sfx.playWhoosh();
        else if (activeBeatIndex === 2) sfx.playCrispPop();
      }
    }
    if (!isPlaying) lastBeatRef.current = -1;
  }, [activeBeatIndex, isPlaying, isMuted]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (currentTime >= 15.0) {
      setCurrentTime(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      if (bgMusicRef.current) bgMusicRef.current.currentTime = 0;
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Reset / Replay
  const handleReset = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    }
  };

  // Scrubber Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(newTime, audioRef.current.duration || 14.5);
    }
    if (bgMusicRef.current) {
      bgMusicRef.current.currentTime = newTime % (bgMusicRef.current.duration || 60);
    }
  };

  // Currently spoken word in the timing map
  const activeWordObj = WORD_TIMESTAMPS.find(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  // Subtitle lines for the current beat
  const line1Words = WORD_TIMESTAMPS.filter(
    (w) => w.beat === safeBeatIdx && w.line === 0
  );
  const line2Words = WORD_TIMESTAMPS.filter(
    (w) => w.beat === safeBeatIdx && w.line === 1
  );

  return (
    <div
      className="relative w-full max-w-[390px] aspect-[9/16] max-h-[92vh] bg-stone-950 rounded-[2.5rem] p-2 sm:p-2.5 shadow-2xl border-4 border-stone-800 flex flex-col justify-end overflow-hidden select-none"
      onMouseEnter={() => setControlsHovered(true)}
      onMouseLeave={() => setControlsHovered(false)}
    >
      {/* Dynamic Video Layers (Ken Burns Pan & Zoom) */}
      <div
        className="absolute inset-0 z-0 overflow-hidden rounded-[2.2rem] cursor-pointer"
        onClick={handleTogglePlay}
      >
        {beats.map((beat, idx) => {
          const isCurrent = safeBeatIdx === idx;
          const animationClass =
            idx === 0
              ? "animate-kenburns-1"
              : idx === 1
              ? "animate-kenburns-2"
              : "animate-kenburns-3";

          return (
            <div
              key={beat.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-out ${
                isCurrent ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <img
                src={beat.imagePath}
                alt={`Shot ${idx + 1}`}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform ${
                  isPlaying && isCurrent ? animationClass : "scale-105"
                }`}
              />
            </div>
          );
        })}

        {/* Ambient Floating Particles when playing */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <div
              className="absolute w-2 h-2 rounded-full bg-white/40 blur-[0.5px]"
              style={{ top: "60%", left: "22%", animation: "float-ice 4s ease-in-out infinite" }}
            />
            <div
              className="absolute w-1.5 h-1.5 rounded-full bg-cyan-200/50 blur-[0.5px]"
              style={{ top: "42%", left: "72%", animation: "float-ice 5s ease-in-out infinite 1s" }}
            />
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-white/30 blur-[1px]"
              style={{ top: "78%", left: "48%", animation: "float-ice 4.5s ease-in-out infinite 0.5s" }}
            />
          </div>
        )}

        {/* Subtle transparent bottom contrast gradient for crystal-clear readability without any text box */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Big Prominent Center Play Button Overlay */}
      {!isPlaying && (
        <div
          onClick={handleTogglePlay}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center cursor-pointer bg-black/30 backdrop-blur-[2px] transition-all"
        >
          <div className="w-20 h-20 rounded-full bg-amber-500/90 text-stone-950 flex items-center justify-center shadow-2xl hover:scale-105 hover:bg-amber-400 active:scale-95 transition-all">
            <Play className="w-10 h-10 ml-1.5 fill-current" />
          </div>
          <span className="text-white text-xs font-bold uppercase tracking-widest mt-4 reel-text-shadow">
            {currentTime >= 15.0 ? "Replay Video" : "Tap to Play"}
          </span>
        </div>
      )}

      {/* Kinetic Borderless Subtitles (Zero background box) */}
      <div className="relative z-20 pb-4 px-3 text-center pointer-events-none">
        {/* Line 1 */}
        <p className="text-xl sm:text-2xl font-black font-display tracking-tight leading-snug reel-text-shadow text-white">
          {line1Words.map((item, idx) => {
            const isWordActive =
              activeWordObj && activeWordObj.text === item.text && activeWordObj.start === item.start;
            return (
              <span
                key={idx}
                className={`inline-block mr-1.5 transition-all duration-100 ${
                  isWordActive ? "reel-word-active" : "text-white"
                }`}
              >
                {item.text}
              </span>
            );
          })}
        </p>

        {/* Line 2 */}
        <p className="text-xl sm:text-2xl font-black font-display tracking-tight leading-snug reel-text-shadow mt-1 text-white">
          {line2Words.map((item, idx) => {
            const isWordActive =
              activeWordObj && activeWordObj.text === item.text && activeWordObj.start === item.start;
            return (
              <span
                key={idx}
                className={`inline-block mr-1.5 transition-all duration-100 ${
                  isWordActive ? "reel-word-active" : "text-amber-300"
                }`}
              >
                {item.text}
              </span>
            );
          })}
        </p>
      </div>

      {/* Clean Floating Glassmorphism Controls */}
      <div
        className={`relative z-30 w-full mb-1 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white transition-opacity duration-300 ${
          isPlaying && !controlsHovered ? "opacity-75 hover:opacity-100" : "opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrubber Progress Bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono tabular-nums text-white/80 w-8">
            {currentTime.toFixed(1)}s
          </span>
          <input
            type="range"
            min="0"
            max="15"
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <span className="text-[11px] font-mono tabular-nums text-white/60 w-8 text-right">
            15.0s
          </span>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Background Jazz & Voice Indicators + Mute Button */}
          <div className="flex items-center gap-2">
            {/* Background Jazz Volume Slider Badge */}
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 text-white/80 border border-white/5 text-[11px]"
              title={`Background Jazz Volume: ${(bgMusicVolume * 100).toFixed(0)}%`}
            >
              <Music className={`w-3.5 h-3.5 ${isPlaying && !isMuted && bgMusicVolume > 0 ? "text-amber-300 animate-pulse" : "text-white/40"}`} />
              <input
                type="range"
                min="0"
                max="0.25"
                step="0.01"
                value={bgMusicVolume}
                onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
                className="w-11 sm:w-14 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                title={`Music volume: ${(bgMusicVolume * 100).toFixed(0)}%`}
              />
              <span className="text-[9px] font-mono tabular-nums text-white/60">
                {(bgMusicVolume * 100).toFixed(0)}%
              </span>
            </div>

            {isPlaying && !isMuted && (
              <div className="flex items-center gap-0.5 mr-0.5" title="Natural Voice Active">
                <span className="w-1 bg-amber-400 rounded-full animate-[sound-wave_0.8s_ease-in-out_infinite]" />
                <span className="w-1 bg-amber-400 rounded-full animate-[sound-wave_0.8s_ease-in-out_infinite_0.2s]" />
                <span className="w-1 bg-amber-400 rounded-full animate-[sound-wave_0.8s_ease-in-out_infinite_0.4s]" />
              </div>
            )}

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-stone-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
