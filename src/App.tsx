import React, { useState, useEffect, useRef } from "react";
import { Coffee, Play, Pause, RotateCcw, Copy, Check, Sparkles, ArrowRight, Share2, Award } from "lucide-react";
import { OFFICIAL_BEATS, BeatItem } from "./data/scriptData";
import { ReelSimulator } from "./components/ReelSimulator";
import { ScriptCardView } from "./components/ScriptCardView";
import { TeleprompterStudio } from "./components/TeleprompterStudio";
import { CulturalGuide } from "./components/CulturalGuide";
import { ExportStudio } from "./components/ExportStudio";

export default function App() {
  const [beats, setBeats] = useState<BeatItem[]>(OFFICIAL_BEATS);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Playback timer ticker for 15s reel
  useEffect(() => {
    if (isPlaying) {
      const stepMs = 50;
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 15.0) {
            setIsPlaying(false);
            return 15.0;
          }
          return Math.min(15.0, prev + stepMs / 1000);
        });
      }, stepMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (currentTime >= 15.0) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
  };

  const handleUpdateBeat = (id: string, updatedNarration: string) => {
    setBeats((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const words = updatedNarration.trim().split(/\s+/).filter(Boolean);
        // split into 2 lines for subtitle
        const midPoint = Math.ceil(words.length / 2);
        const line1 = words.slice(0, midPoint).join(" ");
        const line2 = words.slice(midPoint).join(" ");
        return {
          ...b,
          narration: updatedNarration,
          wordCount: words.length,
          subtitleLines: [line1, line2]
        };
      })
    );
  };

  const handleResetDefaults = () => {
    setBeats(OFFICIAL_BEATS);
  };

  const copyFullOfficialNarration = () => {
    const fullText = beats.map((b) => `[${b.timeRange}] ${b.narration}`).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 selection:bg-amber-200">
      {/* 
        TOP BAR CONTRACT:
        [Brand title, one line] — [4–5 nav links, 1–2 word labels, single-line] — [1 primary action]
      */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="text-lg sm:text-xl font-bold tracking-tight text-stone-950 font-display whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <Coffee className="w-5 h-5 text-amber-600" />
            <span>Ah-Ah Script Studio</span>
          </a>

          {/* Zone 2: 4–5 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <a href="#simulator" className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0">
              Reel Simulator
            </a>
            <a href="#script-beats" className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0">
              Script Beats
            </a>
            <a href="#teleprompter" className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0">
              Teleprompter
            </a>
            <a href="#culture" className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0">
              Korean Culture
            </a>
            <a href="#export" className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0">
              Export
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={copyFullOfficialNarration}
              className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              {copiedScript ? (
                <>
                  <Check className="w-3.5 h-3.5 text-stone-950" />
                  <span>Copied 15s Script</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy 15s Script</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
        {/* HERO SPLIT SECTION */}
        <section id="simulator" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
              <span>Short-Form Video Narration</span>
              <span aria-hidden="true">·</span>
              <span>15 Seconds</span>
              <span aria-hidden="true">·</span>
              <span className="font-korean">한국 커피 문화</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-950 font-display leading-[1.15]" style={{ textWrap: "balance" }}>
              Why Korea Runs on Iced Americano (&ldquo;아이스 아메리카노&rdquo;)
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              A punchy, 3-beat narration crafted for foreign coffee lovers. Unpack the national love for &ldquo;Ah-Ah&rdquo;—from zero calories and budget café culture to the legendary &ldquo;Eoljukah&rdquo; winter obsession.
            </p>

            {/* Quick Master Narration Highlight */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Complete 15-Second Spoken Script
              </div>
              <div className="space-y-2 text-stone-900 font-medium text-sm sm:text-base leading-relaxed">
                <p>
                  <span className="font-mono text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mr-2 font-bold">0–5s</span>
                  &ldquo;In Korea, everyone drinks <strong className="font-korean font-bold">“아이스 아메리카노”</strong>—that’s Iced Americano! It’s so refreshing.&rdquo;
                </p>
                <p>
                  <span className="font-mono text-xs text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded mr-2 font-bold">5–10s</span>
                  &ldquo;You’ll find it everywhere, and it’s super affordable with low calories.&rdquo;
                </p>
                <p>
                  <span className="font-mono text-xs text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded mr-2 font-bold">10–15s</span>
                  &ldquo;That’s why Koreans sip it all year round—even in winter!&rdquo;
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleTogglePlay}
                className="px-5 py-2.5 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {isPlaying ? "Pause Preview" : "Play Reel Simulation"}
              </button>

              <a
                href="#teleprompter"
                className="px-5 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                Practice Voiceover
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Adjacency Proof Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-stone-200">
              <div>
                <span className="text-xl font-bold font-display text-stone-950 block tabular-nums">
                  15.0s
                </span>
                <span className="text-xs text-stone-500">Total Duration</span>
              </div>
              <div>
                <span className="text-xl font-bold font-display text-stone-950 block tabular-nums">
                  32 Words
                </span>
                <span className="text-xs text-stone-500">Across 3 Beats</span>
              </div>
              <div>
                <span className="text-xl font-bold font-display text-stone-950 block tabular-nums">
                  &le; 12 Words
                </span>
                <span className="text-xs text-stone-500">Per 5s Window</span>
              </div>
              <div>
                <span className="text-xl font-bold font-display text-stone-950 block tabular-nums">
                  2 Lines
                </span>
                <span className="text-xs text-stone-500">Per Subtitle Card</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Reel Simulator */}
          <div className="lg:col-span-5 flex justify-center">
            <ReelSimulator
              beats={beats}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTimeChange={handleTimeChange}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
            />
          </div>
        </section>

        {/* SECTION 2: SCRIPT CARDS BREAKDOWN */}
        <section id="script-beats" className="scroll-mt-20">
          <ScriptCardView
            beats={beats}
            onUpdateBeat={handleUpdateBeat}
            onResetDefaults={handleResetDefaults}
          />
        </section>

        {/* SECTION 3: REHEARSAL & TELEPROMPTER */}
        <section id="teleprompter" className="scroll-mt-20">
          <TeleprompterStudio beats={beats} />
        </section>

        {/* SECTION 4: KOREAN COFFEE CULTURE GUIDE */}
        <section id="culture" className="scroll-mt-20">
          <CulturalGuide />
        </section>

        {/* SECTION 5: EXPORT & CONSTRAINT AUDIT */}
        <section id="export" className="scroll-mt-20">
          <ExportStudio beats={beats} />
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer className="mt-20 border-t border-stone-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Ah-Ah Script Studio</span>
            <span aria-hidden="true">·</span>
            <span>Created for Social Video Creators &amp; Coffee Explorers</span>
          </div>
          <div>
            <span>Korean Coffee Culture Series · Seoul, South Korea</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
