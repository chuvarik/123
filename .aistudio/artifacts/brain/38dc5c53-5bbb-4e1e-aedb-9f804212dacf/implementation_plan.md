# Pure Reel Video Player: Korean Iced Americano 15s

Transform the application into a distraction-free, standalone vertical video player (9:16) centered on the screen, removing all exterior documentation sections, cards, cultural essays, headers, and footers while preserving the natural Google Gemini neural narration voiceover, kinetic on-screen subtitles, and audio sound effects.

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following presentation choices:
> - **Display Mode**: Centered vertical video with clean floating controls on a dark cinematic canvas.
> - **Playback Start**: Ready to play with a prominent centered "Tap to Play" overlay button.
> - **Clean Aesthetics**: All peripheral text, script cards, teleprompter, cultural guide, exporter, top navigation, and footer are completely removed.

- **Confirmed Decision 1**: Eliminate the exterior grid, top navigation bar, footer, and text explanation sections, dedicating 100% of the viewport to the vertical video experience.
- **Confirmed Decision 2**: Keep the proven natural Google Gemini neural voiceover (`/audio/master_15s_voiceover.wav`) perfectly synchronized with word-by-word highlight animations and sfx.
- **Confirmed Decision 3**: Provide sleek, non-intrusive floating glassmorphism controls (play/pause toggle, replay, sound mute/unmute, and progress scrubber) that fade gracefully.

---

## 1. Overview & Core Concept

- **What It Does**: Presents a 15-second vertical social-media video (Reels/Shorts/TikTok style) exploring why South Koreans love Iced Americano ("아이스 아메리카노" / "Ah-Ah"), featuring continuous Ken Burns camera motion, crisp kinetic captions, and a warm, natural narrator voice.
- **Target Audience**: Video creators, social media audiences, and coffee enthusiasts who want to experience the 15-second video in its purest, intended format.
- **Key Value**: Delivers the video exactly as viewers would see it on a mobile device or feed without clutter or distractions.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Initial Screen**: The user arrives at a dark, atmospheric screen featuring the 9:16 vertical video container centered vertically and horizontally. A glowing play button invites the user to start playback.
2. **Playback Execution**: Upon tapping, the video starts smoothly:
   - **0–5s**: First beat with ice cubes clinking sfx and intro to “아이스 아메리카노”.
   - **5–10s**: Second beat with transition whoosh and street café scene discussing affordability and low calories.
   - **10–15s**: Third beat with crisp pop sfx and winter “얼죽아” culture.
3. **Interactive Floating Controls**: Hovering or tapping reveals subtle floating controls (Pause/Play, Restart, Mute toggle, and smooth timeline scrubber).
4. **Completion / Replay**: At 15 seconds, a clean "Replay" affordance appears, enabling immediate re-watching.

### Visual Identity & Theme
- **Color Palette**: Rich pitch dark cinematic backdrop (`#0c0a09` / `stone-950`), warm amber accents (`#f59e0b` / `amber-500`), and neon yellow kinetic word highlights (`#fde047` / `yellow-300`).
- **Typography**: Bold display headline font (`Outfit`) for kinetic subtitles with black outline stroke (`reel-text-shadow`) directly over the video without any box or background.
- **Motion & Transitions**:
  - Smooth Ken Burns zoom and pan across shots.
  - Floating ambient ice/condensation particles during active playback.
  - Word-by-word kinetic highlight in sync with the spoken natural voiceover.

---

## 3. Key Product Decisions & Trade-Offs

- **Dedicated Viewport Experience**:
  - *Chosen Approach*: Replace the complex multi-panel dashboard in `App.tsx` with a single, responsive centered viewport component (`ReelPlayer`).
  - *Why*: Direct response to the user's explicit instruction: *"убери все описательное вокруг оставь только видео"* (remove everything descriptive around, leave only the video).
  - *Alternatives Considered*: Hiding sections in an accordion or tab was rejected because the user specifically requested removing all surrounding descriptions.
- **Sound & Voiceover Engine**:
  - *Chosen Approach*: Retain the natural neural voiceover audio track (`master_15s_voiceover.wav`) and precise word-timestamp sync that the user praised (*"голос классный"*).
  - *Why*: Guarantees high-fidelity audio without browser speech synthesis robotic artifacts.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                 App.tsx (Cinematic Shell)                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Centered 9:16 Video Stage                │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Dynamic Video Scene (Ken Burns + Particles)     │  │  │
│  │  │ 0–5s: Ice Americano Cup Macro                   │  │  │
│  │  │ 5–10s: Seoul Hongdae Street Cafes               │  │  │
│  │  │ 10–15s: Winter Eoljukah Puffer Gloves           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Kinetic Subtitles (Direct on footage, NO box)   │  │  │
│  │  │ Words light up in sync with natural voice       │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Floating Minimal Controls (Play/Pause/Scrubber) │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Audio Engine:                                              │
│  - master_15s_voiceover.wav (Google Gemini Neural Voice)    │
│  - Web Audio API Sound Effects (Ice clink, whoosh, pop)     │
└─────────────────────────────────────────────────────────────┘
```

- **State Management**:
  - `currentTime`: Continuous playback time between 0.0s and 15.0s.
  - `isPlaying`: Playback state controlling audio element and video animation loops.
  - `isMuted`: Audio mute/unmute toggle.
- **Refactoring Strategy**:
  - Simplify `App.tsx` into a clean full-height container centering the vertical video.
  - Streamline `ReelSimulator.tsx` to focus purely on the video player, floating controls, and centered play overlay, eliminating unnecessary clutter.
