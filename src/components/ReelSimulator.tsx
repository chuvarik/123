import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Mic2, Radio } from "lucide-react";
import { BeatItem } from "../data/scriptData";
import { sfx } from "../utils/narratorAudio";

interface ReelSimulatorProps {
  beats: BeatItem[];
  currentTime: number;
  isPlaying: boolean;
  onTimeChange: (time: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
}

// Exact word timestamp map for ultra-accurate kinetic word bounce with natural audio
const WORD_TIMESTAMPS = [
  // Beat 1 (0.0s - 4.87s)
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

  // Beat 2 (4.87s - 9.27s)
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

  // Beat 3 (9.27s - 13.58s)
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

export const ReelSimulator: React.FC<ReelSimulatorProps> = ({
  beats,
  currentTime,
  isPlaying,
  onTimeChange,
  onTogglePlay,
  onReset
}) => {
  const [isVoiceoverActive, setIsVoiceoverActive] = useState(true);
  const [voiceEngine, setVoiceEngine] = useState<"neural" | "browser">("neural");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedBrowserVoice, setSelectedBrowserVoice] = useState<string>("");

  const masterAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize master natural neural audio
  useEffect(() => {
    const audio = new Audio("/audio/master_15s_voiceover.wav");
    audio.preload = "auto";
    masterAudioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  // Sync natural audio playback with isPlaying & currentTime
  useEffect(() => {
    const audio = masterAudioRef.current;
    if (!audio) return;

    if (voiceEngine === "neural" && isVoiceoverActive) {
      if (isPlaying) {
        audio.playbackRate = playbackSpeed;
        // Resync if drift exceeds 0.25s
        if (Math.abs(audio.currentTime - currentTime) > 0.25) {
          audio.currentTime = Math.min(currentTime, audio.duration || 14.5);
        }
        audio.play().catch((err) => console.warn("Audio play prevented", err));
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, voiceEngine, isVoiceoverActive, playbackSpeed]);

  // Sync audio seek when scrubbing slider
  useEffect(() => {
    const audio = masterAudioRef.current;
    if (audio && voiceEngine === "neural") {
      if (Math.abs(audio.currentTime - currentTime) > 0.3) {
        audio.currentTime = Math.min(currentTime, audio.duration || 14.5);
      }
    }
  }, [currentTime, voiceEngine]);

  // Load browser voices as fallback option
  useEffect(() => {
    const loadVoices = () => {
      if (!("speechSynthesis" in window)) return;
      const v = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith("en"));
      setBrowserVoices(v);
      if (v.length > 0 && !selectedBrowserVoice) {
        setSelectedBrowserVoice(v[0].name);
      }
    };
    loadVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedBrowserVoice]);

  // Active beat
  const activeBeatIndex = beats.findIndex(
    (b) => currentTime >= b.startSec && currentTime < b.endSec
  );
  const safeBeatIdx = activeBeatIndex !== -1 ? activeBeatIndex : 0;
  const currentBeat = beats[safeBeatIdx];

  // Sound effects on beat start
  const lastBeatRef = useRef<number>(-1);
  useEffect(() => {
    if (isPlaying && activeBeatIndex !== -1 && activeBeatIndex !== lastBeatRef.current) {
      lastBeatRef.current = activeBeatIndex;
      if (activeBeatIndex === 0) sfx.playIceClink();
      else if (activeBeatIndex === 1) sfx.playWhoosh();
      else if (activeBeatIndex === 2) sfx.playCrispPop();
    }
    if (!isPlaying) lastBeatRef.current = -1;
  }, [activeBeatIndex, isPlaying]);

  // Find currently spoken word in the timing map
  const activeWordObj = WORD_TIMESTAMPS.find(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onTimeChange(newTime);
  };

  // Subtitle lines for the current beat
  const line1Words = WORD_TIMESTAMPS.filter(
    (w) => w.beat === safeBeatIdx && w.line === 0
  );
  const line2Words = WORD_TIMESTAMPS.filter(
    (w) => w.beat === safeBeatIdx && w.line === 1
  );

  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      {/* 
        Phone Mockup Frame:
        - 100% clean video view: NO background box on text, NO top badges/stickers
        - Pure kinetic captions floating directly on footage with high-contrast text stroke
        - Continuous cinematic Ken Burns camera motion & floating particles
      */}
      <div className="relative w-full aspect-[9/16] bg-stone-950 rounded-[2.5rem] p-2.5 shadow-2xl border-4 border-stone-800 flex flex-col justify-end overflow-hidden select-none">
        
        {/* Dynamic Continuous Video Layers (Ken Burns Pan & Zoom) */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[2.2rem]">
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
                  alt={`Reel Scene ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform ${
                    isPlaying && isCurrent ? animationClass : "scale-105"
                  }`}
                />
              </div>
            );
          })}

          {/* Floating Atmospheric Condensation Particles */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              <div
                className="absolute w-2 h-2 rounded-full bg-white/40 blur-[0.5px]"
                style={{ top: "65%", left: "20%", animation: "float-ice 4s ease-in-out infinite" }}
              />
              <div
                className="absolute w-1.5 h-1.5 rounded-full bg-cyan-200/50 blur-[0.5px]"
                style={{ top: "40%", left: "75%", animation: "float-ice 5s ease-in-out infinite 1s" }}
              />
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-white/30 blur-[1px]"
                style={{ top: "80%", left: "45%", animation: "float-ice 4.5s ease-in-out infinite 0.5s" }}
              />
            </div>
          )}

          {/* Transparent bottom contrast gradient so text remains ultra-legible with ZERO box */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
        </div>

        {/* 
          CLEAN REEL SUBTITLES:
          - NO background box
          - Kinetic text with heavy drop shadow and text stroke (TikTok/Reel style)
          - Words dynamically illuminate in neon yellow as the natural narrator utters them
        */}
        <div className="relative z-20 pb-5 px-3 text-center pointer-events-none">
          {/* Subtitle Line 1 */}
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

          {/* Subtitle Line 2 */}
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

          {/* Sleek bottom timeline in phone */}
          <div className="w-full bg-white/20 h-1 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-100 ease-linear"
              style={{ width: `${(currentTime / 15) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 
        NARRATOR & REEL CONTROLS:
        Studio AI Natural Voice (Gemini Kore Neural Voice) + Browser Voice Engine Option
      */}
      <div className="w-full mt-4 p-4 bg-stone-900 border border-stone-800 rounded-2xl shadow-md text-stone-200 space-y-3.5">
        
        {/* Voice Engine Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isPlaying && isVoiceoverActive ? "bg-amber-500/20 text-amber-400" : "bg-stone-800 text-stone-400"}`}>
              <Mic2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>Natural Studio Narrator</span>
                {isPlaying && isVoiceoverActive && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-1 bg-amber-400 rounded-full animate-[sound-wave_0.8s_ease-in-out_infinite]" />
                    <span className="w-1 bg-amber-400 rounded-full animate-[sound-wave_0.8s_ease-in-out_infinite_0.2s]" />
                    <span className="w-1 bg-amber-400 rounded-full animate-[sound-wave_0.8s_ease-in-out_infinite_0.4s]" />
                  </span>
                )}
              </div>
              <span className="text-[11px] text-amber-400/90 font-medium">
                Google Gemini Neural Voice (Warm &amp; Natural)
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsVoiceoverActive(!isVoiceoverActive)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isVoiceoverActive
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                : "bg-stone-800 text-stone-400 hover:text-stone-200"
            }`}
          >
            {isVoiceoverActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5" /> Voice On
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" /> Muted
              </>
            )}
          </button>
        </div>

        {/* Voice Model Selector (Neural Studio vs Browser TTS) */}
        <div className="flex items-center justify-between gap-2 text-xs bg-stone-950/60 p-2 rounded-xl border border-stone-800">
          <span className="text-stone-400 shrink-0 font-medium">Voice Mode:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setVoiceEngine("neural")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                voiceEngine === "neural"
                  ? "bg-amber-500 text-stone-950 font-semibold shadow-xs"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              🌟 Gemini Neural (Natural)
            </button>
            <button
              onClick={() => setVoiceEngine("browser")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                voiceEngine === "browser"
                  ? "bg-white text-stone-950 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              System TTS
            </button>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-mono tabular-nums text-stone-400 w-9">
            {currentTime.toFixed(1)}s
          </span>
          <input
            type="range"
            min="0"
            max="15"
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-xs font-mono tabular-nums text-stone-400 w-9 text-right">
            15.0s
          </span>
        </div>

        {/* Beat Markers */}
        <div className="grid grid-cols-3 gap-1.5">
          {beats.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => onTimeChange(b.startSec)}
              className={`text-[11px] py-1.5 px-1 rounded-lg text-center transition-all font-medium ${
                safeBeatIdx === idx
                  ? "bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-xs font-semibold"
                  : "bg-stone-800/80 text-stone-400 hover:text-stone-200 border border-transparent"
              }`}
            >
              Beat {idx + 1} ({b.timeRange})
            </button>
          ))}
        </div>

        {/* Playback Button Strip */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              title="Reset to 0s"
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onTogglePlay}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  {currentTime >= 15 ? "Replay Reel" : "Play Reel (Natural Voice)"}
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-400 text-[11px]">Speed:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-300 focus:outline-none"
            >
              <option value="0.9">0.9x</option>
              <option value="1">1.0x</option>
              <option value="1.1">1.1x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
