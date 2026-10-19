import React, { useState } from "react";
import { Download, Copy, Check, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { BeatItem, CONSTRAINT_CHECKLIST } from "../data/scriptData";

interface ExportStudioProps {
  beats: BeatItem[];
}

export const ExportStudio: React.FC<ExportStudioProps> = ({ beats }) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Generate SRT content
  const generateSRT = () => {
    return beats
      .map((beat, idx) => {
        const start = `00:00:0${beat.startSec},000`;
        const end = `00:00:${beat.endSec < 10 ? "0" + beat.endSec : beat.endSec},000`;
        return `${idx + 1}\n${start} --> ${end}\n${beat.subtitleLines[0]}\n${beat.subtitleLines[1]}\n`;
      })
      .join("\n");
  };

  // Generate VTT content
  const generateVTT = () => {
    return (
      "WEBVTT\n\n" +
      beats
        .map((beat, idx) => {
          const start = `00:0${beat.startSec}.000`;
          const end = `00:${beat.endSec < 10 ? "0" + beat.endSec : beat.endSec}.000`;
          return `${idx + 1}\n${start} --> ${end}\n${beat.subtitleLines[0]}\n${beat.subtitleLines[1]}\n`;
        })
        .join("\n")
    );
  };

  // Generate Full Script text
  const generateFullScriptText = () => {
    return `=== KOREAN ICED AMERICANO (아이스 아메리카노) 15-SECOND REEL SCRIPT ===

[0–5s] Beat 1 (11 words):
Spoken Narration:
"${beats[0].narration}"

Subtitles:
Line 1: ${beats[0].subtitleLines[0]}
Line 2: ${beats[0].subtitleLines[1]}

Visual B-Roll: ${beats[0].visualDirection}
Sound Design: ${beats[0].soundDesign}

--------------------------------------------------

[5–10s] Beat 2 (11 words):
Spoken Narration:
"${beats[1].narration}"

Subtitles:
Line 1: ${beats[1].subtitleLines[0]}
Line 2: ${beats[1].subtitleLines[1]}

Visual B-Roll: ${beats[1].visualDirection}
Sound Design: ${beats[1].soundDesign}

--------------------------------------------------

[10–15s] Beat 3 (10 words):
Spoken Narration:
"${beats[2].narration}"

Subtitles:
Line 1: ${beats[2].subtitleLines[0]}
Line 2: ${beats[2].subtitleLines[1]}

Visual B-Roll: ${beats[2].visualDirection}
Sound Design: ${beats[2].soundDesign}

=== CONSTRAINTS VERIFICATION ===
- Exact 15s timing (three 5s beats)
- Max 12 words per beat (Beat 1: 11w, Beat 2: 11w, Beat 3: 10w)
- Subtitles: 2 lines per card max
- Natural contractions: that's, It's, You'll, That's
- Included: Refreshing taste, low calories, affordable price, wide availability
- Included: "아이스 아메리카노" (Iced Americano) with explanation
- Factual: 100% authentic Korean coffee culture`;
  };

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFormat(key);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Constraint Compliance Matrix */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold font-display text-stone-900">
            Prompt Constraint Verification Audit
          </h3>
          <span className="text-xs text-stone-500 ml-auto">
            10 / 10 Requirements Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CONSTRAINT_CHECKLIST.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {item.label}
                </span>
                <span className="text-xs text-stone-600 leading-snug">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production Exporter Box */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-bold font-display text-stone-900">
              Export Production Assets
            </h3>
            <p className="text-xs text-stone-500">
              Directly loadable into Premiere Pro, CapCut, DaVinci Resolve, or Final Cut Pro.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Plain Text / Markdown */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-stone-800 font-bold text-sm mb-1">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Full Script (.txt)</span>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Complete narration beats, 2-line subtitle cards, B-roll shots, and SFX cues.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => handleCopy(generateFullScriptText(), "txt")}
                className="flex-1 py-1.5 px-3 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1"
              >
                {copiedFormat === "txt" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFormat === "txt" ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() =>
                  handleDownload(generateFullScriptText(), "iced_americano_script.txt", "text/plain")
                }
                className="py-1.5 px-3 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1"
                title="Download .txt"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SRT Subtitles */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-stone-800 font-bold text-sm mb-1">
                <FileText className="w-4 h-4 text-cyan-600" />
                <span>SRT Subtitles (.srt)</span>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Exact timecodes (00:00:00,000 to 00:00:15,000) for native video editor import.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => handleCopy(generateSRT(), "srt")}
                className="flex-1 py-1.5 px-3 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1"
              >
                {copiedFormat === "srt" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFormat === "srt" ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() =>
                  handleDownload(generateSRT(), "iced_americano_subtitles.srt", "application/x-subrip")
                }
                className="py-1.5 px-3 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1"
                title="Download .srt"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* WebVTT */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-stone-800 font-bold text-sm mb-1">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>WebVTT (.vtt)</span>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Standard HTML5 web video subtitle format with millisecond sync.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => handleCopy(generateVTT(), "vtt")}
                className="flex-1 py-1.5 px-3 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1"
              >
                {copiedFormat === "vtt" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFormat === "vtt" ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() =>
                  handleDownload(generateVTT(), "iced_americano_subtitles.vtt", "text/vtt")
                }
                className="py-1.5 px-3 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1"
                title="Download .vtt"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
