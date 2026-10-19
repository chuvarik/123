import React, { useState } from "react";
import { Copy, Check, Clock, Edit2, RotateCcw, Sparkles } from "lucide-react";
import { BeatItem } from "../data/scriptData";

interface ScriptCardViewProps {
  beats: BeatItem[];
  onUpdateBeat?: (id: string, updatedNarration: string) => void;
  onResetDefaults?: () => void;
}

export const ScriptCardView: React.FC<ScriptCardViewProps> = ({
  beats,
  onUpdateBeat,
  onResetDefaults
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempText, setTempText] = useState<string>("");

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (beat: BeatItem) => {
    setEditingId(beat.id);
    setTempText(beat.narration);
  };

  const saveEditing = (id: string) => {
    if (onUpdateBeat) {
      onUpdateBeat(id, tempText);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-display">
            Video Narration &amp; Subtitle Beats
          </h2>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
            <span>3 Beats</span>
            <span aria-hidden="true">·</span>
            <span>5 Seconds Each (15s Total)</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Max 12 Words Per Beat</span>
          </div>
        </div>

        {onResetDefaults && (
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Official Script
          </button>
        )}
      </div>

      {/* Beats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {beats.map((beat, index) => {
          const words = beat.narration.trim().split(/\s+/).filter(Boolean);
          const currentWordCount = words.length;
          const isOverLimit = currentWordCount > 12;

          return (
            <div
              key={beat.id}
              className="flex flex-col justify-between bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-stone-300 transition-all p-5"
            >
              <div>
                {/* Beat Header Bar */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      Beat {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-stone-700 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {beat.timeRange}
                    </span>
                  </div>

                  {/* Word Count Indicator */}
                  <div
                    className={`text-xs font-semibold font-mono tabular-nums px-2 py-0.5 rounded ${
                      isOverLimit
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                    title={isOverLimit ? "Exceeds 12-word limit" : "Within 12-word limit"}
                  >
                    {currentWordCount} / 12 words
                  </div>
                </div>

                {/* Spoken Narration */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span className="font-medium uppercase tracking-wider text-[10px]">
                      Spoken Narration
                    </span>
                    {onUpdateBeat && (
                      <button
                        onClick={() =>
                          editingId === beat.id
                            ? saveEditing(beat.id)
                            : startEditing(beat)
                        }
                        className="text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        {editingId === beat.id ? "Done" : "Edit"}
                      </button>
                    )}
                  </div>

                  {editingId === beat.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        className="w-full text-sm font-medium text-stone-900 border border-amber-400 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        rows={3}
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span
                          className={`font-mono ${
                            tempText.trim().split(/\s+/).filter(Boolean).length > 12
                              ? "text-rose-600 font-bold"
                              : "text-stone-500"
                          }`}
                        >
                          {tempText.trim().split(/\s+/).filter(Boolean).length} / 12 words
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-stone-600 hover:text-stone-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEditing(beat.id)}
                            className="px-3 py-1 bg-amber-500 text-stone-950 rounded font-medium hover:bg-amber-400"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <blockquote className="text-base font-semibold text-stone-900 leading-relaxed font-display bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                      &ldquo;{beat.narration}&rdquo;
                    </blockquote>
                  )}
                </div>

                {/* Subtitle Card (Max 2 lines) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
                    <span className="font-medium uppercase tracking-wider text-[10px]">
                      Subtitle Card (2 Lines Max)
                    </span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          `${beat.subtitleLines[0]}\n${beat.subtitleLines[1]}`,
                          `sub-${beat.id}`
                        )
                      }
                      className="text-stone-400 hover:text-stone-700 transition-colors flex items-center gap-1 text-[11px]"
                    >
                      {copiedId === `sub-${beat.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Card</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-stone-900 text-white rounded-xl p-3 text-center border border-stone-800 space-y-1">
                    <p className="text-xs sm:text-sm font-semibold text-amber-300">
                      {beat.subtitleLines[0]}
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-stone-100">
                      {beat.subtitleLines[1]}
                    </p>
                  </div>
                </div>

                {/* Cultural Terminology In Beat */}
                {beat.koreanTerms.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-stone-400 mb-1.5">
                      Korean Expression
                    </div>
                    {beat.koreanTerms.map((term, tIdx) => (
                      <div
                        key={tIdx}
                        className="bg-stone-50 rounded-lg p-2.5 border border-stone-100"
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-stone-900 font-korean">
                            {term.term}
                          </span>
                          <span className="text-xs text-stone-500 font-mono">
                            ({term.romanization})
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5 leading-snug">
                          {term.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Visual Shot & Audio Cue */}
                <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                  <div>
                    <span className="font-semibold text-stone-700">Visual Cue: </span>
                    <span className="text-stone-600 leading-normal">
                      {beat.visualDirection}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-700">Audio / SFX: </span>
                    <span className="text-stone-500">{beat.soundDesign}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400 font-mono">
                  {beat.timeRange}
                </span>
                <button
                  onClick={() => handleCopyText(beat.narration, `narration-${beat.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  {copiedId === `narration-${beat.id}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Spoken Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
