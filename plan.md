# Minimalist Diary App — Build Plan

A minimal, single-purpose journaling app for Android, built with React + Capacitor.
Goal: portfolio piece + personal daily-use app + learning project (understand every part of the code, not just generate it).

## Product Spec (locked for v1)

**Screens**
1. **Entry** (default/home view) — cream background (~#FAF6EF), muted date/time label, auto-focused multiline text field (serif font, e.g. Lora/Source Serif/Charter), single visible "Save" button. Hamburger icon top corner opens the menu. No keyboard-shortcut save.
2. **Timeline** — reverse-chronological list of entry cards (date, time, first line/snippet). Tap a card to open it full-screen for reading/editing.
3. **Calendar** — month grid, dot marker on days with ≥1 entry, tap a day to jump to that day's entries.
4. **Settings** — JSON export (all entries), daily reminder notification toggle + time picker, About section.

**Data model**
```
Entry {
  id: string        // uuid
  createdAt: string // ISO timestamp, set once
  updatedAt: string // ISO timestamp, updated on edit
  text: string
}
```
- Multiple entries per day allowed.
- Entries are editable anytime (no locking).
- No accounts, no login for v1. Data lives on-device only for v1.

**Stack**
- React (UI)
- Capacitor (native Android wrapper)
- Capacitor Preferences plugin — local storage (JSON array of entries; simple key-value, no SQL needed at this scale)
- Capacitor Local Notifications plugin — daily reminder toggle
- Capacitor Filesystem + Share plugins — JSON export via native share sheet

**Deferred to a later phase (not in v1)**
- Optional cloud sync via a small Netlify-hosted database, with a chosen username instead of email/password, and strict per-user data isolation — purely to prevent data loss on uninstall, not a real multi-user account system.

## Naming (deferred — decide before Phase 7 / Play Store listing)

Directions considered:
- Plain/functional: Daily
- Warm/ritual: Dear, Today, Still
- Abstract/brandable: Nook, Paperlight, Inkling

Decision: not yet made — revisit later.

## Build Phases

### Phase 0 — Environment setup
- Install Node.js, install Android Studio (needed for Capacitor's Android build tooling and emulator).
- Understand: what Capacitor actually does (wraps a web app in a native shell + exposes native APIs via plugins), vs a "real" native app.

### Phase 1 — Project scaffolding
- Create the React app (Vite recommended over CRA — faster, simpler).
- Add Capacitor, initialize it, add the Android platform.
- Get a blank "Hello World" screen running in the Android emulator.
- Understand: the relationship between your `web` build folder, Capacitor's config, and the generated native Android project.

### Phase 2 — Entry screen (core loop)
- Build the Entry screen UI (text field + Save button + date label).
- Wire up Capacitor Preferences: save a new Entry object into a local JSON array on Save.
- Understand: how Preferences stores data under the hood, and why it's fine for this data size (vs when you'd need SQLite).

### Phase 3 — Timeline + Calendar
- Read all entries from storage, render as a chronological card list.
- Add the hamburger menu and basic navigation (React Router or simple state-based view switching — worth discussing which fits a 4-screen app).
- Build the Calendar view, mark days with entries, tap-to-filter into the timeline.
- Understand: list rendering, grouping entries by date, basic client-side routing.

### Phase 4 — Editing entries
- Tapping a timeline card opens the entry pre-filled and editable.
- Save updates `updatedAt`, leaves `createdAt` untouched.

### Phase 5 — Settings: export, notifications, about
- JSON export: serialize all entries, write to a file via Capacitor Filesystem, trigger the native Share sheet.
- Daily reminder: Capacitor Local Notifications, toggle + time picker, schedule/cancel a repeating local notification.
- About section: static text/screen.

### Phase 5.5 — Design handoff
- Generate the mockup in Claude Design using the design prompt (see below).
- Extract concrete specs from the mockup: background hex, font family + weights, font sizes, spacing/padding values, button styling.
- Paste those exact values into the Phase 6 notes below before handing this plan to Claude Code.

### Phase 6 — Visual polish
- Apply the design spec (white background, clean sans-serif — e.g. Inter) consistently across all 4 screens.
- Exact values from Claude Design mockup: [fill in after handoff — bg color, font, spacing]
- Typography pass, spacing, transitions between screens.

## Design Prompt (for Claude Design)

> Design a minimal journaling app UI (Android, mobile-first).
>
> **Overall aesthetic:** Extremely minimal, calm, and uncluttered. Plain white background throughout. Clean, modern sans-serif font (e.g. Inter, or similar) for all UI text. Generous white space, no visual clutter, no unnecessary borders or shadows. Black typography on white — high contrast, simple.
>
> **Screen 1 — Entry (default/home screen):** Opens directly to this screen every time the app launches. One large, auto-focused multiline text input, taking up most of the screen. A single short placeholder phrase inside the empty input (e.g. "What's on your mind today?"). One visible "Save" button below the input. A hamburger icon in the top corner (top-right) — the only other element on this screen — opens the menu. No other buttons, icons, or decoration.
>
> **Screen 2 — Timeline:** Reverse-chronological list of past entries as simple cards. Each card shows: date, time, and a short snippet/first line of the entry. Tapping a card opens it full-screen, pre-filled and editable. Minimal card styling — thin dividers or subtle spacing rather than heavy shadows/borders.
>
> **Screen 3 — Calendar:** Standard month grid view. Small dot/marker under days that have at least one entry. Tapping a day filters/jumps to that day's entries in the timeline.
>
> **Screen 4 — Settings:** Username field (simple text input). "Download my data" button — exports all entries as a JSON file. Notification toggle — daily reminder on/off, with a time picker when enabled. About section — short static text about the app.
>
> **Navigation:** No persistent tab bar or bottom nav. Only the hamburger icon (top-right, visible on the entry screen) opens a simple menu linking to Timeline, Calendar, and Settings.
>
> **Interaction notes:** Entries are editable anytime, no locking. Multiple entries per day are allowed, each with its own timestamp. No account/login required beyond the local username field.

### Phase 7 — Build & ship
- Generate a signed Android build (keystore setup).
- Test on a real device.
- (Optional) Play Store listing prep.

## Working method
- One phase at a time. Explain each concept before generating code for it.
- Prefer small, understandable commits over large generated blocks.
- Revisit and simplify anything that feels like "magic."
