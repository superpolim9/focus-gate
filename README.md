# Focus Gate 🌑

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-success.svg)](package.json)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-black.svg)](#quick-start--one-command-launch)
[![Local First](https://img.shields.io/badge/Privacy-100%25%20Local--First-orange.svg)](#privacy--local-first-design)

A science-backed, distraction-free local focus launcher & study workspace. Built for deep work, course lectures, and exercise sessions without rabbit holes or context switching.

Everything lives **100% on your machine**: zero accounts, zero trackers, zero subscriptions, and zero external npm dependencies.

---

## Quick Start — One-Command Launch

Clone and start in seconds on any operating system:

### 🪟 Windows (PowerShell)
```powershell
git clone https://github.com/superpolim9/focus-gate.git; cd focus-gate; .\Start` Focus` Gate.bat
```
*(Or double-click `Start Focus Gate.bat` / `Start Focus Gate.vbs` for silent launch without a terminal window).*

### 🍎 macOS & 🐧 Linux (Terminal)
```bash
git clone https://github.com/superpolim9/focus-gate.git && cd focus-gate && chmod +x start.sh && ./start.sh
```

### ⚡ Using Node / NPM
```bash
git clone https://github.com/superpolim9/focus-gate.git && cd focus-gate && npm start
```

---

## The Science — Why It Works

Focus Gate is engineered around cognitive and behavioral neuroscience:

1. **The 10-Minute Rule (Zeigarnik Effect & Overcoming Inertia):**
   The human brain resists *starting* far more than *doing*. A tiny, honest commitment of 10 minutes eliminates task dread. At the 10-minute chime, you are genuinely permitted to wrap up. That psychological honesty is why it builds lasting daily consistency.
2. **Fixed-Gaze Meditation (Trataka Focus):**
   Clinical studies demonstrate that 60–90 seconds of focused gaze on a single point significantly calms neural chatter, enhances selective visual attention (+26% on Stroop tests), and stabilizes working memory.
3. **The Physiological Sigh (Rapid Autonomic Reset):**
   Researched at Stanford (*Cell Reports Medicine*, 2023): two deep nasal inhales followed by one long, slow mouth exhale rapidly offloads $\text{CO}_2$ and slows heart rate, shifting the nervous system from anxiety into calm alertness before demanding work.
4. **Leave-a-Thread Protocol:**
   At the end of every block, you write one line: *"Where I left off & first step next time"*. Your next session starts with zero ramp-up friction.

---

## Session Workflow

```
[ Enter Subject ] ──► [ The Point (75s Gaze) ] ──► [ One Breath (60s Sigh) ] ──► [ THE GATE: 10 Min ]
                                                                                         │
   ┌─────────────────────────────── Choice at Soft Chime ────────────────────────────────┘
   ├─► Continue 25 min ──► [ Focus Block ] ──► [ Guided Eye/Hydration Break ] ──► Repeat
   ├─► Continue 50 min ──► [ Focus Block ] ──► [ Guided Eye/Hydration Break ] ──► Repeat
   └─► Wrap Up ──► Write 1-line thread ──► Auto-saved to Journal & Stats
```

- **Non-Blocking In-Session Overlays:** Press **▶ Video**, **⚡ Apps**, or **📝 Notes** at any time. The underlying focus timer and audio continue uninterrupted.
- **Keyboard Shortcuts:**
  - `Space` — Pause / resume focus timer
  - `Esc` — Close overlays and instantly return to active timer
  - `F` — Toggle full screen

---

## Core Features

### 1. 📺 Integrated Video Room (Courses & Chapter Navigation)
- **Watch Course Modules:** Play YouTube lectures and course playlists directly inside the workspace without opening external tabs or getting trapped in algorithm feeds.
- **Sequential Chapter Navigation (`⏮ Prev` / `⏭ Next`):** Seamlessly step from chapter to chapter directly from the player bar.
- **Channel Course Explorer:** Browse any channel or instructor (e.g. `@Ennajisciences`) to see all course playlists and uploaded videos.
- **▶ Play All:** 1-click continuous playback through entire module playlists.
- **Zero YouTube Error 153:** The lightweight built-in local server provides a valid origin, completely resolving YouTube's embed restrictions on local files.

### 2. ⚡ Companion Work & Study Apps
- **Embedded Tools (Desmos, Excalidraw):** Graph functions and sketch geometry directly inside the workspace.
- **Smart Side-by-Side Windows (ChatGPT, Claude, DeepSeek):** External AI and productivity apps automatically dock neatly to the right 58% of your screen during sessions, keeping the timer, sound, and notes visible on the left.
- **Custom Apps:** Easily add any website or URL with custom icons and launch modes.

### 3. 📝 In-Session Lesson Scratchpad
- **Distraction-Free Notepad:** Take notes, paste exercise formulas, or record ChatGPT explanations without leaving your focus flow.
- **Auto-Saved Per Subject:** Notes for *"Linear Algebra"* or *"Machine Learning"* stay organized and load automatically whenever you choose that subject.
- **1-Click Copy:** Instant clipboard export.

### 4. 🎧 Built-In Audio Engine
- **Synthesized Live in Browser (100% Offline, Zero Downloads):**
  - **Deep Space:** Dark cinematic evolving ambient drone (Interstellar style)
  - **Brown Noise:** Warm, low-frequency acoustic masking for deep reading
  - **Pink Rain:** Gentle soothing rainfall frequency
  - **Binaural Beats:** 40 Hz Gamma (peak focus), 16 Hz Beta, and 10 Hz Alpha modes (for headphones)
- **Offline Local Audio:** Drop any `.mp3`, `.wav`, or `.flac` files into the `music/` folder for instant local playback.

### 5. 📊 Journal & Habit Analytics
- Daily focus minutes, streaks, and subject breakdown.
- Session logs with intentions, ratings, and "where I left off" threads.
- 1-click export to `.json` or `.csv`.

---

## Privacy & Local-First Design

- **No telemetry, analytics, or tracking.**
- **No external cloud accounts required.**
- All session logs, notes, and custom apps are stored locally in your browser's persistent `localStorage`.
- All backend code runs strictly on `localhost` (127.0.0.1).

---

## Project Structure

```
focus-gate/
├── Focus Gate.html        # The complete single-file client application
├── server.js              # Tiny zero-dependency Node.js local proxy & server
├── server.py              # Zero-dependency Python fallback server
├── Start Focus Gate.bat   # 1-click Windows launcher
├── Start Focus Gate.vbs   # 1-click silent Windows launcher
├── start.sh               # 1-click macOS / Linux launcher
├── package.json           # Optional npm start script
├── LICENSE                # MIT License
└── music/                 # Optional folder for your local MP3/audio files
    └── README.md
```

---

## License

This project is licensed under the [MIT License](LICENSE) — free for personal, educational, and commercial use.
