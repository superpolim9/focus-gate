# Focus Gate — Build Plan

A tiny, local focus launcher. One HTML file. No install, no server, no accounts, no internet required (except YouTube streams).

## The idea (based on research, your instincts were right)

Your two core instincts are backed by real studies:

1. **"Always start with 10 minutes"** — this is the classic *10-Minute Rule*. The research reasoning:
   the brain resists *starting*, not working. A tiny commitment (10 min) removes the dread ("50 minutes? no thanks"),
   but once your brain is engaged, inertia carries you forward (Zeigarnik effect). The critical detail: after 10
   minutes you must *genuinely* be allowed to stop — that honesty is what makes the trick work every day.
2. **"Stare at a point until the brain goes quiet"** — this is almost exactly **Trataka**, a fixed-gaze practice
   studied in clinical trials: ~2–3 minutes of gazing at a single point measurably improved selective attention
   (Stroop test +26%), working memory, and reduced mind-wandering.
3. **The "anesthesia before the operation"** — the best-researched tool is the **physiological sigh** (Stanford,
   Cell Reports Medicine 2023): double inhale through the nose + long slow exhale, done for ~1 minute, beats even
   mindfulness meditation for reducing anxiety and lowering physiological arousal.
4. **Music** — evidence for focus sound: white/pink noise gives a small real benefit for attention; 40 Hz gamma
   binaural beats help most with a *low carrier tone + background noise* (needs headphones); brown noise is widely
   loved for steady focus. "Interstellar-style" long ambient streams exist on YouTube; plus the app can generate
   sounds **live in the browser** so you never have to download anything.
5. **End of every session: leave a thread.** Write one line "where I left off → first step next time" before you
   close. Next session starts warm instead of cold. (Elite writers/programmers do this; Zeigarnik again —
   stop mid-thread so restarting is cheap.)

## What gets built

### Files

| File | Purpose |
|---|---|
| `Focus Gate.html` | The entire app. Double-click to run. All data saved in the browser on this machine. |
| `music/` | Empty folder. Drop any MP3s you download here — they appear in the player automatically. |

### The session flow

```
[ Enter subject ] ──► [ The Ritual ~2 min ] ──► [ The Gate: 10 min ] ──► choice
                                                                 ├─ Continue 25 → block → break → block...
                                                                 ├─ Continue 50
                                                                 └─ Wrap up → journal line → home
```

1. **Home** — dark, calm, minimal. Typing the subject name (it autocompletes with subjects you used before),
   one big button: **Start session**. Recent subjects shown as chips (one click).
2. **The Ritual (~2 minutes, skippable)** — the "anesthesia":
   - **The Point** (~60–90 s): full black screen, one small glowing dot that gently breathes. Just look at it.
   - **One Breath** (~60 s): an expanding/contracting circle; double inhale in, looong exhale out, guided
     by the animation.
3. **The Gate — 10 minutes**: the timer starts on its own, fullscreen, beautiful, with the subject name and your
   session intention visible. No notifications. Nothing else on screen.
4. **After 10 minutes**: a soft chime. Three buttons:
   **Continue 25** · **Continue 50** · **Wrap up** (truly allowed — that permission is the secret).
   Continuing keeps the same timer block running; the "10-minute debt is paid" state is saved.
5. **Between blocks**: a calm break screen (5 min default, with "skip break" if you're in flow).
6. **Wrap up**: one journal line asked of you: *"Where did I leave off / first step next time?"* — saved and
   shown as the warm start line next time you pick the same subject. Plus a one-tap "how was it" rating.
7. **Tracking** — a Sessions page: today's focus minutes, day streak, per-subject totals, full session history
   (subject, intention, durations, continued-or-stopped, rating, left-off note). One-click export to JSON/CSV.

### The music player (tiny floating control, one click, never leaves the session screen)

- **Built-in (generated live — instant, offline, nothing to download):**
  - **Deep Space** — a slowly evolving dark ambient drone (Interstellar-ish)
  - **Brown Noise** — deep steady noise (the most popular study noise)
  - **Pink Rain** — softer pink noise, rain-like
  - **40 Hz Focus (beta/alpha modes)** — binaural tones, **headphones required**
- **YouTube** — embedded long streams so you never open a browser tab:
  - curated picks included (8 h smoothed brown noise, Interstellar-style 8 h ambience, a deep-focus stream)
  - paste-your-own YouTube link box (any video, saved for next time)
- **Local** — anything in the `music/` folder appears in the player automatically.

### Small extra touches

- Gentle desktop notifications + soft chime when a block or break ends.
- Fullscreen toggle. Escape hatch: pause the timer (sessions can pause, life happens).
- Everything keyboard-friendly; Enter starts the ritual from home.
- First-run helps you allow notifications and fullscreen if you want them (both optional).

## Notes / limitations

- The HTML file must stay next to the `music/` folder (relative paths).
- Data lives in the browser you open it with (use the same browser every time).
- YouTube + binaural tones need internet / headphones respectively; built-in drone + noises work fully offline.

---

# Round 2 — stay inside the workspace

The next wish was: *don't leave this page ever* — find and keep YouTube videos inside it,
and use Gmail / ChatGPT without abandoning the workspace. Two features:

## 1. The video room (`scr-yt`)

- Opened from the player pill's YouTube tab (**🔎 Search & watch videos**).
- **Search** posts to YouTube's public web endpoint (`youtubei/v1/search`, WEB client —
  the same endpoint youtube.com itself uses). No key, no sign-in.
  - Sent with a `text/plain` body on purpose: that makes the request "CORS-simple"
    (no preflight) — and YouTube's endpoint happens to answer `Origin: null`,
    which is exactly the origin a `file://` page has. Verified live (HTTP 200 +
    result objects) and verified to refuse normal web origins, oddly inverted from
    what you'd expect.
  - Results parse `videoRenderer` nodes; deduped, capped at 24; thumbnails come from
    `i.ytimg.com/vi/<id>/mqdefault.jpg`; live badge / length from `lengthText`.
- **Play** happens inside the page (`youtube.com/embed/…`) — no navigation. The player
  pill carries title + stop; audio continues when the room closes (Esc).
- **★ library** (`data.ytSaved`, localStorage, cap 80): any result or starter can be
  kept; saved items show in the pill for one-tap replay. Migrations: the old single
  `savedYt` string folds into the library on first run.
- **Pasted links** are enriched via YouTube's oEmbed (also `Origin: null`-friendly):
  real title + channel, then saved.
- If search is ever refused by YouTube: friendly failure with two still-perfect backups —
  ↻ retry, ⧉ open youtube.com in a real window — and paste-link always works.

## 2. Work apps (`scr-apps` / `scr-app`)

- **Apps** button on home (and during breaks). Starter tiles: ChatGPT, Gmail, Calendar,
  Claude, Notion, WhatsApp (`data.apps`, localStorage, seeded on first run).
- Modes per app (click the small tag to cycle `auto → window → embed`):
  - **own window** — `window.open` with a computed size, reused per app via window name,
    fullscreen exits first. Logins persist in the browser profile. The focus page keeps
    running underneath (timers are timestamp-based; music keeps playing).
  - **try embedded** — opens `scr-app`: a full-height frame inside the page with a top
    bar (back, ⧉ own window, close). Honest note under the frame: most big apps set
    `X-Frame-Options/CSP frame-ancestors` and refuse — those get mode `window` by default
    via a host list (`auto`).
- Add-your-own apps (name + URL, `https://` auto-prefixed, emoji icon guessed from host);
  "restore starter apps" if tiles were deleted. Esc unwinds the screen stack
  (`RT.stack`) back to whatever the user came from.

## Verification done

- `node` syntax check + every `$('id')` reference resolves.
- Live Chromium (harness browser): zero console errors on load and through interactions —
  room open, play (frame src set), save/unsave, apps grid, add app (URL fix, icon),
  mode cycle, embedded frame launch, Esc stack unwind (appframe→apps→home), paste-link
  fallback path, fresh reload state.
- CORS facts proven in-browser with an opaque-origin sandboxed iframe: search POST 200
  (301 KB, videoRenderers present) + oEmbed 200 — both from `Origin: null`, i.e. the
  double-clicked-file scenario. (An http origin gets 403 — expected and irrelevant for
  the real usage.)
- Fixed a real layout bug found while testing: on narrow windows (<980 px) the stacked
  video room columns overlapped (flex `1 1 auto` split of a fixed-height container) →
  media query now uses `flex:none` with grid-level scrolling.


---

# Round 3 — The In-Session Lesson Workspace & YouTube Error 153 Solution

## What was requested & the core problems identified:
1. **YouTube Error 153 inside local files**: YouTube's embed player enforces Referer/Origin verification, which fails with Error 153 on `file://` (null origin).
2. **Accessing tools DURING sessions**: The user uses videos and AI apps (ChatGPT) for real lessons and exercises. They needed access to Video, Apps, and Notes directly during active 10-minute focus sessions without stopping the timer.
3. **OpenCode's bottleneck**: OpenCode reached free token limits right as it had refactored screens into overlays and attempted to test. It also skipped solving the local YouTube playback problem, merely telling the user to self-host a bridge page on GitHub Pages.

## Solutions Implemented:

### 1. Defeating YouTube Error 153 via Zero-Config Local Launcher
- Created `server.js` (Node.js) and `server.py` (Python fallback) to serve Focus Gate locally on `http://127.0.0.1:8899`.
- Created `Start Focus Gate.bat` (1-click batch launcher) and `Start Focus Gate.vbs` (completely silent launcher with no terminal popup).
- With a valid `localhost` HTTP origin, YouTube embeds load natively with **zero Error 153**, allowing in-page video playback directly in the Video Room.
- Added automatic detection in `Focus Gate.html`: if opened via `file://`, it checks if the local server is running and provides a 1-click migration button (`#migrate=...`) to transfer all localStorage state without data loss.

### 2. In-Session Overlays (`scr-yt`, `scr-apps`, `scr-notes`)
- Refactored `scr-yt` (Video Room), `scr-apps` (Quick Access Apps), `scr-app` (Embedded Viewer), and `scr-notes` (Lesson Scratchpad) into fixed overlays (`.overlay.on`).
- Opening an overlay preserves the underlying timer engine (`RT.phase` remains `PH.BLOCK` or `PH.BREAK`); the timer continues counting down and audio continues playing.
- Added `btnVideoBlock`, `btnAppsBlock`, and `btnNotesBlock` to `scr-block` and `scr-break`.
- `Esc` or `← Back` instantly peels off the top overlay and returns directly to the running session.

### 3. Lesson Scratchpad (`scr-notes`)
- Auto-saved per subject (`data.notes[subject]`).
- Clean, focused writing area for exercise equations, lecture notes, or ChatGPT prompts.
- 1-click copy to clipboard.

### 4. Smart Side-by-Side App Placement
- In `launchWindow`, when a session is active, external apps (ChatGPT, Claude, DeepSeek) are automatically sized (58% width) and docked to the right side of the screen (`L = 41%`), leaving Focus Gate visible on the left.
- Embedded study tools (Desmos Graphing Calculator, Excalidraw Whiteboard) open directly inside `scr-app`.

## Verification Done:
- Node syntax and script check passed cleanly.
- ID reference checker verified all 108 used IDs resolve against HTML IDs.
- End-to-end headless Edge CDP test verified:
  - App catalog initialization (9 apps).
  - Active block session initiation and timer countdown.
  - Notes overlay opening, input event auto-saving to subject, Esc unwinding.
  - Video room overlay opening, `server.js` active notice verification, YouTube video loading without Error 153.
  - Apps overlay opening, Desmos embedded frame launch in `scr-app`, and double-Esc unwinding back to active focus timer.

---

# Round 4 — Course Channels, Sequential Chapters & Playlist Browsing

## What was requested:
The user studies course modules divided into sequential chapter videos (e.g. `Ennajisciences`). They finished one video and needed:
1. The ability to browse the channel directly from the workspace to discover all course playlists.
2. The ability to load full playlists, view all chapter videos in order with durations and titles, jump to any chapter, and "Play all".
3. Sequential playback: `⏮ Prev` and `⏭ Next` chapter navigation buttons directly in the player bar.

## Solutions Implemented:

### 1. Backend YouTube Proxies (`server.js` & `server.py`)
- `/api/yt-search?q=...`: Bypasses browser CORS restrictions on localhost, returning YouTube search results with video and channel renderers.
- `/api/yt-browse?id=...&params=...`: Proxies YouTube InnerTube browse endpoints for playlists (`VL<playlistId>`) and channel tabs (`params=EglwbGF5bGlzdHPyBgoKCEIGCgIQaCIA` for playlists, `params=EgZ2aWRlb3PyBgQKAjoA` for videos).
- `/api/yt-channel?q=...`: Resolves channel handles (e.g. `@Ennajisciences`), channel names, and direct `UC...` IDs into complete channel objects (title, handle, subscriber count, avatar).
- `/api/yt-oembed?v=...`: Fetches official video metadata without browser restrictions.

### 2. Client-Side Video Room Engine (`Focus Gate.html`)
- **Mode Tabs:** `🔎 Search`, `📑 Chapters`, `📺 Channel`, `★ Saved`, `✦ Starters`.
- **`parseBrowse(node)`:** Universal parser extracting videos and playlists from both modern (`lockupViewModel`) and classic (`playlistVideoRenderer`, `gridPlaylistRenderer`, `videoRenderer`) InnerTube payloads.
- **`loadPlaylist(playlistId, preferredVidId)`:** Fetches full playlist contents, populates `VR.queue`, extracts playlist title and author info, renders chapter list with indices and durations, highlights the playing chapter, and activates the Chapters view.
- **`loadChannel(queryOrId, tab)`:** Resolves channel metadata, fetches course playlists or uploaded videos, and renders interactive cards.
- **`renderChannelPlaylists(playlists)`:** Displays course playlists with custom thumbnails, video counts, 1-click "Chapters" button, and 1-click "Play all" button.
- **Sequential Navigation (`updateNavButtons()`, `playNext()`, `playPrev()`):**
  - Player bar now includes `⏮` (Previous chapter) and `⏭` (Next chapter) buttons that dynamically update disabled/opacity states as you navigate the queue.
  - Player bar includes a `📺 <Channel Name>` button that opens the channel's course playlists with one click.
- **Smart Detection in Search & Paste Inputs:**
  - Pasting a channel URL (`youtube.com/@...` or `youtube.com/channel/UC...`) or typing `@channel` immediately opens the channel courses.
  - Pasting a playlist URL immediately loads all chapters and plays from chapter 1.
  - Searching a channel name shows an interactive channel card banner at the top of results.

## Verification Done:
- E2E Headless Edge CDP test suite (`test_e2e_channels_playlists.js`) verified:
  - Channel `Ennajisciences` resolved: 10 course playlists extracted and rendered.
  - Playlist `PLZahTn-qQezByPV1eleYyggprdRuOZsE2` loaded: 81 sequential chapter videos extracted with titles and durations.
  - First chapter played: player bar showed title, `⏮ Prev` disabled, `⏭ Next` enabled, `📺 Ennajisciences` channel button visible.
  - Next chapter clicked: successfully advanced to Chapter 2 ("General information on continuous signals and systems") and enabled `⏮ Prev`.
  - Search detection verified: searching `Ennajisciences` returned 20 video results with the channel banner at the top.
  - Full screenshot captured and archived.
