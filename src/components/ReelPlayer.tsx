import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Check,
  ChevronDown
} from "lucide-react";
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
  const [masterVolume, setMasterVolume] = useState<number>(0.9); // Master volume: voice 100%, music 15%
  const [showVolumePopup, setShowVolumePopup] = useState<boolean>(false);

  // Instagram Reel Interactive States
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false);
  const [showActionFeedback, setShowActionFeedback] = useState<string | null>(null);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const tickerRef = useRef<number | null>(null);
  const lastBeatRef = useRef<number>(-1);
  const lastTapTimeRef = useRef<number>(0);

  // Initialize and preload voiceover + background jazz track
  useEffect(() => {
    const audio = new Audio("/audio/master_15s_voiceover.wav");
    audio.preload = "auto";
    audio.volume = masterVolume;
    audioRef.current = audio;

    const bgMusic = new Audio("/assets/aistudio/the_mountain-easy-jazz-618215__1__dc50bca9.mp3");
    bgMusic.preload = "auto";
    bgMusic.loop = true;
    bgMusic.volume = masterVolume * 0.15; // Soft background cafe jazz volume
    bgMusicRef.current = bgMusic;

    return () => {
      audio.pause();
      bgMusic.pause();
    };
  }, []);

  // Synchronize both audio tracks with master volume (music proportionally softer)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = masterVolume;
    }
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = masterVolume * 0.15;
    }
  }, [masterVolume]);

  // Synchronize mute state
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

  // Video Screen Click: Double-tap to Like, Single-tap to Play/Pause
  const handleVideoTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    lastTapTimeRef.current = now;

    if (timeSinceLastTap < 300) {
      // Double tap detected -> Trigger Instagram Heart Burst!
      setIsLiked(true);
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 850);
      return;
    }

    // Single tap -> Toggle Play / Pause
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

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setShowActionFeedback("Link copied!");
    setTimeout(() => setShowActionFeedback(null), 2000);
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
    <div className="relative w-full max-w-[390px] aspect-[9/16] max-h-[96vh] bg-black rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border-4 border-stone-800 flex flex-col justify-between overflow-hidden select-none">
      
      {/* Dynamic Video Layers (Ken Burns Pan & Zoom) */}
      <div
        className="absolute inset-0 z-0 overflow-hidden cursor-pointer"
        onClick={handleVideoTap}
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
                alt={`Reel Shot ${idx + 1}`}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform ${
                  isPlaying && isCurrent ? animationClass : "scale-105"
                }`}
              />
            </div>
          );
        })}

        {/* Ambient Floating Condensation Particles */}
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

        {/* Instagram Scrim: Top & Bottom Gradients for UI clarity */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Double Tap Big Heart Pop Animation (Iconic Instagram feature) */}
      {showHeartBurst && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <Heart className="w-28 h-28 text-white fill-rose-500 animate-heart-burst drop-shadow-2xl" />
        </div>
      )}

      {/* Initial / Paused Center Play Indicator */}
      {!isPlaying && (
        <div
          onClick={handleVideoTap}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center cursor-pointer bg-black/25 backdrop-blur-[1px] transition-all"
        >
          <div className="w-18 h-18 rounded-full bg-black/50 text-white border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md hover:scale-105 transition-all">
            <Play className="w-9 h-9 ml-1 fill-current" />
          </div>
          <span className="text-white text-xs font-semibold tracking-wider uppercase mt-3 drop-shadow-md">
            {currentTime >= 15.0 ? "Replay Reel" : "Tap to Play"}
          </span>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. TOP BAR: Instagram Header ("Reels" wordmark + Audio/Camera) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="relative z-30 flex items-center justify-between px-4 pt-4 text-white">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-bold font-display tracking-tight text-white drop-shadow-md">
            Reels
          </span>
          <ChevronDown className="w-4 h-4 text-white/80 mt-0.5" />
        </div>

        {/* Top Right: Camera Icon & Sound Toggle / Volume */}
        <div className="flex items-center gap-2">
          {/* Volume Button with Expandable Slider */}
          <div className="relative flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              onMouseEnter={() => setShowVolumePopup(true)}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || masterVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-white/70" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Quick volume popup on hover */}
            {showVolumePopup && (
              <div
                onMouseLeave={() => setShowVolumePopup(false)}
                className="absolute top-11 right-0 bg-stone-900/95 backdrop-blur-md border border-white/15 p-2 rounded-xl shadow-xl flex items-center gap-2 z-50 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={isMuted ? 0 : masterVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setMasterVolume(val);
                    if (val > 0 && isMuted) setIsMuted(false);
                    if (val === 0) setIsMuted(true);
                  }}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <span className="text-[10px] font-mono tabular-nums text-white/80 w-6 text-right">
                  {Math.round((isMuted ? 0 : masterVolume) * 100)}%
                </span>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 transition-colors"
            title="Restart Reel"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. CENTER-LOWER: Dynamic Reel Subtitles (NO background box)  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="relative z-20 px-4 text-center pointer-events-none my-auto">
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

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. BOTTOM OVERLAYS: Creator Info + Right Action Column       */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="relative z-30 pb-3 px-3 flex items-end justify-between gap-3">
        
        {/* LEFT: Creator Profile, Caption & Audio Marquee */}
        <div className="flex-1 space-y-2 text-white max-w-[76%]">
          {/* Creator Profile Line */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px] shrink-0 shadow-md">
              <div className="w-full h-full rounded-full bg-stone-900 overflow-hidden flex items-center justify-center">
                <img
                  src={beats[0].imagePath}
                  alt="Seoul Coffee Culture"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <span className="text-xs font-bold tracking-tight text-white drop-shadow-md truncate">
              seoul.coffee.culture
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFollowing(!isFollowing);
              }}
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border transition-all ${
                isFollowing
                  ? "bg-white/20 border-white/30 text-white"
                  : "bg-transparent border-white/60 text-white hover:bg-white/10"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>

          {/* Caption */}
          <div className="text-xs text-white/95 leading-snug drop-shadow-md pr-1">
            <p className={isCaptionExpanded ? "" : "line-clamp-2"}>
              Why South Korea is obsessed with Iced Americano (아이스 아메리카노) ☕️🧊 Even in winter, Koreans never give up on “Ah-Ah”!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCaptionExpanded(!isCaptionExpanded);
              }}
              className="text-[11px] text-white/60 font-medium hover:text-white"
            >
              {isCaptionExpanded ? "less" : "...more"}
            </button>
          </div>

          {/* Audio Marquee Bar (The Mountain • Easy Jazz) */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowVolumePopup(!showVolumePopup);
            }}
            className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] text-white/90 overflow-hidden cursor-pointer hover:bg-black/60 transition-colors w-fit max-w-full"
            title="Audio: The Mountain • Easy Jazz"
          >
            <Music className="w-3.5 h-3.5 text-white shrink-0 animate-pulse" />
            <div className="overflow-hidden whitespace-nowrap w-44">
              <div className="animate-marquee text-[11px]">
                <span className="mr-8">The Mountain · Easy Jazz • Original Audio</span>
                <span className="mr-8">The Mountain · Easy Jazz • Original Audio</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Action Sidebar (Like, Comment, Share, Save, More, Disc) */}
        <div className="flex flex-col items-center gap-3.5 text-white shrink-0 pb-1">
          {/* Like Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
              if (!isLiked) {
                setShowHeartBurst(true);
                setTimeout(() => setShowHeartBurst(false), 850);
              }
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-1.5 transition-transform active:scale-75">
              <Heart
                className={`w-7 h-7 drop-shadow-lg transition-colors ${
                  isLiked
                    ? "fill-rose-500 text-rose-500 scale-110"
                    : "text-white group-hover:text-rose-300"
                }`}
              />
            </div>
            <span className="text-[11px] font-semibold drop-shadow-md">
              {isLiked ? "48.3K" : "48.2K"}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActionFeedback("1,420 comments");
              setTimeout(() => setShowActionFeedback(null), 1800);
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-1.5 transition-transform active:scale-75">
              <MessageCircle className="w-6 h-6 text-white group-hover:text-amber-200 drop-shadow-lg" />
            </div>
            <span className="text-[11px] font-semibold drop-shadow-md">
              1,420
            </span>
          </button>

          {/* Share / Send Button */}
          <button
            onClick={handleShareClick}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-1.5 transition-transform active:scale-75">
              <Send className="w-6 h-6 text-white group-hover:text-cyan-200 drop-shadow-lg -rotate-12" />
            </div>
            <span className="text-[11px] font-semibold drop-shadow-md">
              19.5K
            </span>
          </button>

          {/* Save / Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
            className="p-1.5 transition-transform active:scale-75"
          >
            <Bookmark
              className={`w-6 h-6 drop-shadow-lg transition-colors ${
                isSaved ? "fill-white text-white" : "text-white"
              }`}
            />
          </button>

          {/* More (Three dots) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="p-1.5 text-white/90 hover:text-white transition-transform active:scale-75"
            title="Options"
          >
            <MoreHorizontal className="w-5 h-5 drop-shadow-lg" />
          </button>

          {/* Spinning Audio Vinyl Disc at Bottom Right */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowVolumePopup(!showVolumePopup);
            }}
            className="w-7 h-7 rounded-full border-2 border-stone-800 bg-black p-[2px] shadow-xl overflow-hidden cursor-pointer"
            title="Audio Track: Easy Jazz"
          >
            <div
              className={`w-full h-full rounded-full overflow-hidden ${
                isPlaying ? "animate-spin [animation-duration:3.5s]" : ""
              }`}
            >
              <img
                src={beats[0].imagePath}
                alt="Vinyl Disc Cover"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Toast Feedback Overlay */}
      {showActionFeedback && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold text-white border border-white/20 shadow-2xl animate-fade-in pointer-events-none">
          {showActionFeedback}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. INSTAGRAM TIMELINE PROGRESS BAR (Bottom 2px Edge)         */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div
        className="relative z-30 w-full group/timeline py-1 bg-gradient-to-t from-black/60 to-transparent cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-1 bg-white/25 transition-all group-hover/timeline:h-2">
          <div
            className="bg-white h-full transition-all duration-100 ease-linear shadow-sm"
            style={{ width: `${(currentTime / 15) * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max="15"
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
