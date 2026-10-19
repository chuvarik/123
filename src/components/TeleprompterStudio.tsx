import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Volume2, CheckCircle2, AlertCircle } from "lucide-react";
import { BeatItem } from "../data/scriptData";

interface TeleprompterStudioProps {
  beats: BeatItem[];
}

export const TeleprompterStudio: React.FC<TeleprompterStudioProps> = ({ beats }) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [rehearsalTime, setRehearsalTime] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Active beat during rehearsal
  const activeBeatIdx = beats.findIndex(
    (b) => rehearsalTime >= b.startSec && rehearsalTime < b.endSec
  );

  const startRehearsalSession = async () => {
    setErrorMsg(null);
    setRecordedAudioUrl(null);
    setRehearsalTime(0);

    // Request microphone access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start 3-second countdown
      setCountdown(3);
    } catch (err: any) {
      setErrorMsg("Microphone permission was not granted or is unavailable. You can still rehearse using the timer!");
      setCountdown(3);
    }
  };

  // Handle countdown
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timeout = setTimeout(() => {
        setCountdown((c) => (c !== null ? c - 1 : null));
      }, 1000);
      return () => clearTimeout(timeout);
    } else if (countdown === 0) {
      setCountdown(null);
      beginRun();
    }
  }, [countdown]);

  const beginRun = () => {
    setIsRecording(true);
    setRehearsalTime(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      try {
        mediaRecorderRef.current.start();
      } catch (e) {
        console.warn("Could not start mediaRecorder", e);
      }
    }

    const startTime = Date.now();
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setRehearsalTime(elapsed);
      if (elapsed >= 15.0) {
        stopRehearsalSession(elapsed);
      }
    }, 50);
  };

  const stopRehearsalSession = (finalTime?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordedDuration(finalTime || rehearsalTime);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const togglePlayRecording = () => {
    if (!audioPlayerRef.current && recordedAudioUrl) {
      audioPlayerRef.current = new Audio(recordedAudioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingRecording(false);
    }

    if (!audioPlayerRef.current) return;

    if (isPlayingRecording) {
      audioPlayerRef.current.pause();
      setIsPlayingRecording(false);
    } else {
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current.play();
      setIsPlayingRecording(true);
    }
  };

  return (
    <div className="bg-stone-900 text-white rounded-2xl p-6 border border-stone-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h3 className="text-xl font-bold font-display text-white">
            15s Voiceover Rehearsal Teleprompter
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Test your spoken pacing against the exact 5-second beat windows. Aim to finish between 14.0s and 15.0s.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const refAudio = new Audio("/audio/master_15s_voiceover.wav");
              refAudio.play();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold rounded-xl border border-stone-700 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            Listen to Pro Reference Voice
          </button>

          {!isRecording && countdown === null ? (
            <button
              onClick={startRehearsalSession}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
            >
              <Mic className="w-4 h-4 fill-current" />
              Start 15s Rehearsal
            </button>
          ) : (
            <button
              onClick={() => stopRehearsalSession()}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop Recording
            </button>
          )}

          {recordedAudioUrl && !isRecording && (
            <button
              onClick={togglePlayRecording}
              className="flex items-center gap-2 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 font-semibold text-xs rounded-xl transition-colors border border-stone-700"
            >
              {isPlayingRecording ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Take
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Play Recorded Take
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-stone-800/80 border border-stone-700 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="my-8 py-12 flex flex-col items-center justify-center animate-pulse">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
            Get Ready To Speak...
          </span>
          <span className="text-6xl font-black font-display text-white">
            {countdown === 0 ? "GO!" : countdown}
          </span>
        </div>
      )}

      {/* Teleprompter Display Cards */}
      {countdown === null && (
        <div className="mt-6 space-y-4">
          {/* Progress Timeline Header */}
          <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
            <span>
              Elapsed: <strong className="text-amber-400 text-sm tabular-nums">{rehearsalTime.toFixed(1)}s</strong> / 15.0s
            </span>
            <span>
              {isRecording ? (
                <span className="text-rose-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                  RECORDING ACTIVE
                </span>
              ) : recordedDuration > 0 ? (
                <span className="text-emerald-400 font-medium">
                  Last Take: {recordedDuration.toFixed(1)}s
                </span>
              ) : (
                <span>Ready to rehearse</span>
              )}
            </span>
          </div>

          {/* Master Progress Bar with 3 Beat Markers */}
          <div className="relative w-full h-2.5 bg-stone-800 rounded-full overflow-hidden border border-stone-700">
            <div
              className={`h-full transition-all duration-75 ${
                rehearsalTime > 15 ? "bg-rose-500" : "bg-amber-400"
              }`}
              style={{ width: `${Math.min(100, (rehearsalTime / 15) * 100)}%` }}
            />
            {/* Markers at 5s (33.3%) and 10s (66.6%) */}
            <div className="absolute top-0 bottom-0 left-[33.33%] w-0.5 bg-white/40" />
            <div className="absolute top-0 bottom-0 left-[66.66%] w-0.5 bg-white/40" />
          </div>

          {/* Beat Lines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {beats.map((beat, idx) => {
              const isCurrent = isRecording && activeBeatIdx === idx;
              const isPast = isRecording && rehearsalTime >= beat.endSec;

              return (
                <div
                  key={beat.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    isCurrent
                      ? "bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-500/30 scale-[1.02]"
                      : isPast
                      ? "bg-stone-800/40 border-stone-800 opacity-60"
                      : "bg-stone-800/80 border-stone-700 text-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span
                      className={`font-mono font-bold ${
                        isCurrent ? "text-amber-400" : "text-stone-400"
                      }`}
                    >
                      {beat.timeRange}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {beat.wordCount} words
                    </span>
                  </div>

                  <p
                    className={`text-base font-semibold leading-relaxed ${
                      isCurrent ? "text-amber-200 font-bold" : "text-stone-200"
                    }`}
                  >
                    &ldquo;{beat.narration}&rdquo;
                  </p>

                  <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-stone-400">
                    <span className="font-semibold text-stone-300">Target Pace: </span>
                    ~{((beat.endSec - beat.startSec) / beat.wordCount).toFixed(2)}s per word
                  </div>
                </div>
              );
            })}
          </div>

          {/* Post-Rehearsal Evaluation */}
          {recordedDuration > 0 && !isRecording && (
            <div className="p-4 rounded-xl bg-stone-800/90 border border-stone-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">
                    Rehearsal Complete: {recordedDuration.toFixed(1)} seconds
                  </p>
                  <p className="text-stone-400">
                    {recordedDuration >= 14.0 && recordedDuration <= 15.5
                      ? "Perfect timing! Matches the 15-second social media reel pacing."
                      : recordedDuration < 14.0
                      ? "A bit fast! Slow down slightly to let each beat land clearly."
                      : "Slightly over 15 seconds. Try delivering the contractions a bit crisper."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
