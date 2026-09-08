# Plain Journal — Progress / Todo

Working status tracker, separate from [plan.md](plan.md) (the fixed spec/phase plan) and
[CLAUDE.md](CLAUDE.md) (process rules). Update this file as phases progress.

## Where we are

**Phase 3 (Timeline + Calendar) functionally complete. Phase 5 (Settings) built as a web app:
export/import + About + reset are real, daily reminder is real UI wired to a deliberate stub
(needs Capacitor). Pen favicon done. Dark mode + serif font both done — dark = a sun/moon
`ThemeToggle` icon button in Settings > Appearance; font = a "Sans"/"Serif" button in the same
section. PIN lock fully done (all 7 steps) — 4-digit PIN, opt-in from Settings > Privacy,
styled bottom-sheet setup, launch lock screen with the wordmark. Shared `BottomSheet`
component extracted (ConfirmDialog + PinSetup both use it). Entry masthead is the ORIGINAL
layout (hamburger absolute top-right, wordmark one centered line) — a header-bar restructure
and a masthead theme-toggle were tried and reverted. User has been styling/verifying in the
browser throughout this session. See below.**

## Done

- **Phase 0 — Environment.** Node, JDK, Android SDK confirmed working.
- **Phase 1 — Scaffolding.** Vite + React 19 app in `plain-journal/`. Demo code stripped.
- **Phase 2 — Entry screen.** [EntryScreen.jsx](plain-journal/src/EntryScreen.jsx) with
  auto-focused textarea + Save, backed by [storage.js](plain-journal/src/storage.js)
  (hand-written `localStorage` module — not the Capacitor Preferences plugin yet, on purpose).
- **Phase 3 (partial) — Timeline.** [Timeline.jsx](plain-journal/src/Timeline.jsx) renders
  entries newest-first as cards (timestamp + snippet). Card markup extracted into its own
  [EntryCard.jsx](plain-journal/src/EntryCard.jsx) component (pure refactor, no behavior
  change) so it has a dedicated place to be styled next.
- **Phase 3 (partial) — Navigation.** [App.jsx](plain-journal/src/App.jsx) wired up with
  `react-router-dom` (routes: `/`, `/entry/:id`, `/timeline`, `/settings`). Hamburger menu
  ([HamburgerMenu.jsx](plain-journal/src/HamburgerMenu.jsx)) links to Timeline and Settings,
  animated with `motion`.
- **Phase 4 (partial) — Editing.** `/entry/:id` route exists and `EntryScreen` is reused for
  it, so editing an existing entry is already wired into the routing, ahead of plan.md's
  phase order. Confirmed working: loads the existing entry's text and date, and updates
  (not duplicates) it in storage on Save.
- **Phase 4 (partial) — Editing-state date indicator.** When opened from the Timeline,
  `EntryScreen` now shows that entry's own saved date (not today's) in red
  (`.today-editing`, `#c0392b` in [App.css](plain-journal/src/App.css)), so it's visually
  obvious you're editing a past entry rather than writing a new one. New entries still show
  today's date in the normal grey. Verified in-browser 2026-09-06.
- **Delete entry.** Each Timeline card ([EntryCard.jsx](plain-journal/src/EntryCard.jsx)) has
  a small trash icon (Heroicons `TrashIcon`) that opens a hand-built bottom-sheet confirm
  dialog ([ConfirmDialog.jsx](plain-journal/src/ConfirmDialog.jsx), animated with `motion`,
  no new dependency) asking "Really want to delete this entry?" before calling
  `deleteEntry(id)` in [storage.js](plain-journal/src/storage.js). Deliberately lives only on
  the card, not on the Entry/edit screen. `ConfirmDialog` is generic (message/onConfirm/
  onCancel props), reusable for future confirmations.
- **Back-navigation from Timeline/Settings.** `HamburgerMenu` used to only render inside
  `EntryScreen`, so Timeline and Settings had no way back to `/`. Fixed by rendering
  `<HamburgerMenu />` on all three screens (added to `Timeline.jsx` and a new, extracted
  [Settings.jsx](plain-journal/src/Settings.jsx), pulled out of its old `App.jsx` inline
  placeholder) and adding an "Entry" link to the menu itself alongside Timeline/Settings.
- **Phase 3 — Calendar view.** [Calendar.jsx](plain-journal/src/Calendar.jsx) renders a month
  grid (built by pure helpers in [calendar.js](plain-journal/src/calendar.js): `buildMonthGrid`
  for the padded day layout, `datesWithEntries` for an O(1) lookup Set), with prev/next month
  navigation and a small red dot (`.calendar-day-dot`, `#c0392b`) under days that have ≥1
  entry. Tapping a day navigates to `/timeline?date=YYYY-MM-DD`. Deliberately hand-built
  instead of `<input type="date">` — the native picker can't render custom content (the dot
  markers) inside its grid and isn't meant to stay open as a navigable screen. Routed at
  `/calendar` in [App.jsx](plain-journal/src/App.jsx). Verified working in-browser.
- **Timeline header + calendar entry point.** Per explicit user direction, the Calendar is
  reachable from a button on the Timeline screen (Heroicons `CalendarDaysIcon`, top-left) —
  *not* from the hamburger menu. `Timeline.jsx` wraps this button and `<HamburgerMenu />` in a
  `<header className="timeline-header">` (flex row, real layout space, pushes the entry list
  down instead of floating over it). This header treatment is Timeline-only (explicit user
  choice) — Entry and Settings keep the original absolutely-positioned hamburger.
- **Calendar header, matching pattern.** `Calendar.jsx` got the same problem (hamburger
  overlapping content) and, after a couple of wrong attempts, the same fix: `<header
  className="calendar-header">` contains *only* the hamburger; the month prev/label/next row
  moved out into its own `.calendar-nav` block below the header, not inside it. Prev/next
  chevron buttons restyled to match the hamburger's flat look (`background: none; border:
  none`) — a leftover `.calendar-header button` selector from an earlier layout attempt had to
  be renamed to `.calendar-nav button` once the buttons moved out of the header, or the
  browser-default button chrome silently came back.
- **Icon alignment bug (Timeline header) — root cause.** The calendar-icon button and the
  hamburger looked misaligned because they were governed by two different layout systems:
  `.calendar-button` is a normal flex child (centered by the header's `align-items: center`),
  but `HamburgerMenu`'s outer `.hamburger-menu` is `position: absolute; top: 16px; right: 0` —
  a hardcoded offset from the header's top edge, ignoring the header's real content height/
  padding entirely. Fix: `.timeline-header .hamburger-menu { position: relative; top: auto;
  right: auto }` — scoped only to the Timeline header — turns the hamburger back into a normal
  flex item so both icons share one alignment rule, while staying `relative` (not `static`) so
  it still serves as the positioned anchor for its own dropdown (`.menu-panel`, `position:
  absolute; top: 100%`) — using `static` there breaks the dropdown by making it anchor to the
  whole screen instead of the hamburger button. Same root cause would apply anywhere else
  `HamburgerMenu` is dropped into a flex row alongside another icon — worth remembering if a
  similar header is added elsewhere later.
- **Icon sizing match.** `.calendar-button` (Timeline) and `.calendar-button-icon` restyled to
  `padding: 0` / `40px` icon to exactly match `.hamburger-icon` / `.hamburger-icon-svg`'s
  existing values, so the two header icons render the same size.
- **Timeline date filtering.** `Timeline.jsx` reads an optional `?date=YYYY-MM-DD` query param
  via `useSearchParams()` and filters entries to that day when present (matching
  `entry.ts.slice(0, 10)`), showing a "Showing entries for {date}" label. This is what the
  Calendar's tap-a-day navigation lands on.
- **Phase 5 — Settings screen (web app version).** [Settings.jsx](plain-journal/src/Settings.jsx)
  rewritten from the placeholder into four sections: Your data, Daily reminder, About, Danger
  zone.
  - **Your data — export.** "Export" button calls `downloadEntriesJSON()` in a new
    [export.js](plain-journal/src/export.js): builds a `Blob` from the pretty-printed entries
    JSON (`entriesAsJSON()`, new helper in [storage.js](plain-journal/src/storage.js)), mints
    an object URL, clicks a throwaway `<a download="plain-journal-YYYY-MM-DD.json">`, revokes
    the URL. **Real and working now.** Phase 7 swaps the function body for Capacitor
    `Filesystem.writeFile` + `Share.share` — call site in Settings unchanged.
  - **Your data — import.** "Import" button triggers a hidden `<input type="file"
    accept=".json">` (ref + `.click()`). File read via a `readFileAsText()` Promise-wrapped
    `FileReader` (module-level helper in `Settings.jsx`), text handed to
    `mergeImportedEntries(rawText)` in `storage.js`. That function: `JSON.parse` (throws on
    bad JSON), require `Array.isArray`, validate each item via `isValidEntry` (string
    `id`/`ts`/`text`), **merge by id skipping duplicates** (Set of existing ids, also guards
    dup ids within the file), rebuild each entry as `{id, ts, text}` (strips extra fields),
    `saveEntries([...existing, ...toAdd])`, return `{ imported, skipped }`. Settings shows a
    one-line result (`.settings-hint` on success, `.settings-error` red on thrown error).
    Input `value` reset to `''` after each pick so the same file can be retried.
    User decisions (2026-09-08): merge-not-replace, validate-each-entry.
  - **Daily reminder.** Real, persisted UI: a checkbox toggle + `<input type="time">` (native
    picker, `"HH:MM"` string) that only renders when enabled. Persisted via new
    `loadSettings()` / `saveSettings()` in `storage.js` (own key `plain-journal:settings`,
    `DEFAULT_SETTINGS = { reminderEnabled: false, reminderTime: '20:00' }`, defaults-merge
    guard on load). Wired to `scheduleDailyReminder(time)` / `cancelDailyReminder()` in a new
    [reminder.js](plain-journal/src/reminder.js) — **deliberate stub**: `console.info` only,
    with a full Phase 7 recipe in a comment block. A browser can't fire a notification while
    the app is closed; that needs the OS via `@capacitor/local-notifications`. Only those two
    function bodies change in Phase 7 — UI and storage already model everything (enabled flag
    + `"HH:MM"`). Hint copy explicitly says reminders aren't active yet.
  - **About.** "Plain Journal — a totally free, privacy-first, no-strings-attached private
    journal app by Leon den Engelsen." + version/"data stored on this device only" line.
    (User-authored copy, 2026-09-08.)
  - **Danger zone — reset.** "Reset journal" button (`.settings-button-danger`, red outline)
    opens the existing [ConfirmDialog.jsx](plain-journal/src/ConfirmDialog.jsx) ("Delete ALL
    entries? This can't be undone." / confirm label "Delete everything"). On confirm calls
    `clearAllEntries()` (new in `storage.js` — just `saveEntries([])`, **leaves settings
    untouched** — user decision 2026-09-08: entries only, not a full wipe) and shows a
    confirmation line. `ConfirmDialog` reused as-is, no changes.
  - **State pattern:** `settings` object in `useState(loadSettings)` (lazy init); every
    change handler does update-state + `saveSettings` + schedule/cancel via one `apply(next)`
    helper. No Save button — settings apply immediately. Plus `importResult`, `resetOpen`,
    `resetDone` booleans/objects for the feedback + dialog.
  - **Styles:** new `/* --- Settings screen --- */` block in
    [App.css](plain-journal/src/App.css) — muted 13px section labels, hairline `border-top`
    dividers (`rgba(10,10,10,0.12)`). `.settings-button` deliberately **smaller** than the
    Entry Save button (32px min-height, `0 14px` padding, 13px, `8px` radius not a full
    pill — user said the first pass was "way too big"). `.settings-button-row` flex+gap for
    side-by-side Export/Import. `.settings-row input[type=checkbox|time] { accent-color:
    #c0392b }` — recolors the native control highlight to the app red, kills the browser
    default blue (user asked for no blue in the time picker). `.settings-button-danger` =
    red text + red border, still outline style (no solid fill, per build-decisions).
  - **Idiom review (2026-09-08):** structure is sound and standard — one component per file,
    presentational components take props (`ConfirmDialog` is generic), all non-UI logic in
    plain `.js` modules, `storage.js` is the single data-access layer (repository pattern),
    derived state computed in render not stored, immutable updates, lazy `useState` init,
    canonical hidden-file-input pattern. Minor future refinements noted, not blocking:
    `Settings.jsx` (173 lines) could split into `<DataSection>`/`<ReminderSection>`/
    `<DangerZone>` sub-components if it grows; `importResult`/`resetDone` never auto-clear;
    the 3 pre-existing `set-state-in-effect` lint warnings (Timeline/Calendar/EntryScreen)
    want `useState(() => loadEntries())` instead of empty-init + effect — address in Phase 6.
  - `npm run lint` + `npm run build` clean (only the 3 pre-existing warnings above). **Not
    yet verified in-browser by the user.**
- **Pen favicon.** [public/favicon.svg](plain-journal/public/favicon.svg) replaced Vite's
  default purple bolt with a minimal pen/nib (black stroke, transparent bg, no filters,
  <500 bytes). [index.html](plain-journal/index.html) `<title>` changed `plain-journal` ->
  `Your Journal` to match the on-screen wordmark (package name in package.json untouched).
- **Dark mode.** Full theming system:
  - [index.css](plain-journal/src/index.css): 10 semantic colour tokens (`--color-bg`,
    `--color-text`, `--color-text-muted`, `--color-surface`, `--color-border`,
    `--color-border-faint`, `--color-fill-subtle`, `--color-accent`, `--color-on-accent`,
    `--color-scrim`) on `:root` (light); redefined under `:root[data-theme='dark']` with
    *chosen* dark values (not inverted) — `#141414` bg not pure black, `#e8e8e8` text not
    pure white, accent red lightened `#c0392b` -> `#e35d4f` for contrast on dark.
  - [App.css](plain-journal/src/App.css): every literal colour -> `var(--...)`. Four
    near-identical border treatments (`#dcdcdc`, `rgba(10,10,10,.12/.2/.3)`) collapsed to
    `--color-border` + `--color-border-faint`. `.entry-field`, `.confirm-sheet`, and the
    time input got explicit `background`+`color` (form controls don't inherit).
  - [theme.js](plain-journal/src/theme.js): `loadTheme`/`saveTheme`/`applyTheme`. Own key
    `plain-journal:theme`. `applyTheme` sets/removes `<html data-theme="dark">` — pure CSS
    repaint, no React re-render.
  - [main.jsx](plain-journal/src/main.jsx): `applyTheme(loadTheme())` before `createRoot`
    so there's no flash of light mode on launch.
  - Two bug fixes found in dark mode: `.hamburger-icon` had no `color` so its
    `currentColor` Heroicon stayed dark — set `color: var(--color-text)`. `.menu-panel` had
    no `z-index` so Settings section content painted over the open dropdown — added
    `z-index: 10`.
  - **Control evolved (later this session):** started as a "Dark mode" checkbox in Settings;
    the user then wanted it as a sun/moon icon toggle. Final form:
    [ThemeToggle.jsx](plain-journal/src/ThemeToggle.jsx) — Heroicons `SunIcon`/`MoonIcon`
    button showing the icon for the mode you'd switch TO (moon while light, sun while dark).
    `theme.js` gained a **`useTheme()` custom hook** — `[theme, toggleTheme]`, lazy-init from
    `loadTheme`, toggle does setState + `applyTheme` + `saveTheme`. Each caller gets its own
    state (fine — `applyTheme` repaints via CSS regardless; the state only drives the icon).
    A brief detour put `<ThemeToggle>` in the Entry masthead (with a `.masthead-bar` header
    restructure) — **reverted**; it lives in Settings > Appearance next to the Font button.
    Sun reads smaller than the moon at the same box size (disc+rays vs full crescent) — the
    `.theme-toggle` button box is a fixed 32px and the two icons are sized separately
    (`.theme-toggle-icon-moon` 24px, `.theme-toggle-icon-sun` 28px) so toggling never
    reflows the row.
  - **Smooth light/dark fade:** `toggleTheme` adds a `theme-anim` class to `<html>` (not
    `applyTheme`, so startup isn't animated); `index.css` has `.theme-anim, .theme-anim * {
    transition: background/border-color/color 0.25s ease }`. The bare `.theme-anim` in the
    selector matters — `<html>` carries the page bg via `:root` and `.theme-anim *` only
    matches descendants, so without it the background snapped while everything else faded.
- **Serif font toggle.** Same pattern as dark mode, independent attribute:
  - [index.css](plain-journal/src/index.css): `--font-family` token, default
    `system-ui, sans-serif`; `:root[data-theme-font='serif']` -> `Georgia, 'Times New
    Roman', serif`. `:root` font declaration now `var(--font-family)`. Works app-wide with
    no per-element CSS because every component already inherits the font from `:root`
    (`.wordmark { font-family: inherit }`, `.entry-field { font: inherit }`, etc.).
  - [font.js](plain-journal/src/font.js): `loadFont`/`saveFont`/`applyFont`, key
    `plain-journal:font`, sets `<html data-theme-font="serif">`.
  - [main.jsx](plain-journal/src/main.jsx): `applyFont(loadFont())` alongside the theme.
  - [Settings.jsx](plain-journal/src/Settings.jsx): started as a "Serif font" checkbox;
    user wanted "a button that says which font is active" — final form is a `.settings-button`
    in the Appearance section labelled **"Sans"** / **"Serif"**, `toggleFont()` cycles the two.
    Row label is just "Font". `font` state + `toggleFont`.
  - Decisions (user, 2026-09-08): **Georgia** (system font, no webfont bundle), scope =
    **entire app** (not just the writing surface — and app-wide is actually less code here).
    `data-theme-font` is separate from `data-theme` so dark/serif are orthogonal.
  - `theme.js` + `font.js` are a near-duplicated pattern; fine at 2, generalise to one
    `preference.js` helper only if a 3rd display pref appears.
- **Entry screen height + misc CSS polish (this session).**
  - `.entry-screen` was `min-height: 100vh` *plus* the `.app`'s 20px top/bottom padding, so
    it always overflowed by 40px and scrolled. Now `height: calc(100dvh - 40px)` (exact fit,
    `dvh` for mobile browser chrome) + `min-height: 0` on `.writing-surface` and
    `.entry-field` so the textarea shrinks instead of forcing the page taller. Verified
    in-browser: page height === viewport, no scroll.
  - `.footer` padding `16px 0 32px` -> `12px 0 0` so the Save button sits at the bottom of
    the screen (the `.app` wrapper still gives 20px from the device edge).
  - Hamburger dropdown links restyled as outlined buttons: `1px` border, transparent at
    rest, `font-weight: 500`, `gap: 8px`, `:hover` subtle fill, `:active` `scale(0.98)`.
  - Settings checkboxes bumped to `22px` (from the browser default ~13px), `margin: 0`.
  - `.menu-panel` link `gap`/padding widened a couple of times for tap targets.
- **PIN lock — DONE (all 7 steps).** Decisions (user, 2026-09-08): a **4-digit PIN**
  (not username/password — there's nothing to authenticate against; this is a lock, not a
  login), **SHA-256 hashed** in localStorage via Web Crypto, **no entry encryption** (entries
  stay plain text — the PIN only gates the UI), **off by default** (first use stays simple).
  UI must be upfront that it's a *casual lock, not a vault* — a 4-digit PIN is 10,000
  possibilities and the entries are readable in DevTools regardless; it stops a
  shoulder-surfer, not a determined person.
  - [lock.js](plain-journal/src/lock.js): `hashPin` (async, `crypto.subtle.digest('SHA-256')`
    -> hex), `hasPin`, `loadPinHash`, `savePin`, `clearPin`, `verifyPin` (async). Key
    `plain-journal:pin-hash`. No salt / no slow KDF — deliberate, it'd be theatre for a local
    casual lock.
  - [PinPad.jsx](plain-journal/src/PinPad.jsx): presentational — 4 dots + 3×4 number pad
    (`KEYS` flat array, `''` slot for the bottom-left gap, `⌫` bottom-right), shake on
    `error`. Props `value` / `onKey` / `error`. Exports `PIN_LENGTH = 4`.
  - [LockScreen.jsx](plain-journal/src/LockScreen.jsx): launch lock screen. `entry`/`error`
    state, auto-submits at 4 digits via `verifyPin`, wrong -> shake + clear, right ->
    `onUnlock()`. Renders `<PinPad>`.
  - [AppLock.jsx](plain-journal/src/AppLock.jsx): the gate. `useState(() => !hasPin())` —
    starts unlocked if no PIN. Renders `children` (the app) when unlocked, `<LockScreen>`
    otherwise. **Re-locks on every launch/reload** — no "stay unlocked" window in v1.
  - [main.jsx](plain-journal/src/main.jsx): `<App>` now wrapped in `<AppLock>` inside
    `<BrowserRouter>`.
  - [PinSetup.jsx](plain-journal/src/PinSetup.jsx): the set/remove flow for Settings.
    `hasPin()` decides: no PIN -> enter -> confirm -> `savePin`; PIN exists -> enter current
    -> `clearPin`. `error` is a string here (multiple messages). Calls `onDone(pinNowSet)`
    and `onCancel`. Renders `<PinPad>`.
  - **Step 6 (done):** `Settings.jsx` "Privacy" section — a "Require a PIN" checkbox; toggling
    it opens `<PinSetup>` in a `<BottomSheet>` (not inline). `pinOn` state = `useState(hasPin)`,
    only changes when a PIN is really set/removed; `handlePinDone(pinNowSet)` updates it +
    closes the sheet; `onCancel` just closes (checkbox reverts). Honest hint text about
    casual-lock / no-recovery.
  - **Step 7 (done):** `App.css` — `.lock-screen` (wordmark top, title + pad centred via
    `margin: auto`), `.lock-title`, `.pin-pad-wrap`, `.lock-dots` / `.lock-dot` /
    `.lock-dot-filled`, `.lock-pad` (`grid`, `repeat(3, 72px)`), `.lock-key` (72px round,
    `var(--color-fill-subtle)`, `:active` darker), `.pin-setup`. `LockScreen` shows the
    "Your Journal" wordmark above "Enter your PIN".
  - **BottomSheet refactor (done alongside):** [BottomSheet.jsx](plain-journal/src/BottomSheet.jsx)
    extracted — the backdrop + slide-up panel + tap-outside + Escape-to-close shell.
    `ConfirmDialog.jsx` rewritten to render its message+buttons *inside* `<BottomSheet>`
    (38 lines -> 18, API unchanged). `Settings.jsx` wraps `<PinSetup>` in one too. CSS:
    `.confirm-backdrop`/`.confirm-sheet` -> shared `.sheet-backdrop`/`.sheet-panel` with a
    grab handle (`::before`), `max-width: 520px`, lift shadow, `env(safe-area-inset-bottom)`.
    `.sheet-backdrop { z-index: 100 }` so a sheet covers all page content (was showing the
    Timeline trash icons through it).
  - `npm run lint` + `npm run build` clean.

## Not started yet

- **Calendar dot visual cue — revisit.** User flagged (2026-09-08) wanting a clearer visual
  cue for which days have entries; current small red dot may not be enough (bigger dot, filled
  background, count, etc. all still on the table). Explicitly deferred — logged now, address
  later, not urgent.
- **Phase 5 — Settings. Web-app version COMPLETE.** export / import / reminder-stub / About /
  reset / dark mode / serif toggle / favicon / PIN lock all done. Only remaining piece:
  - **Real daily reminder.** Comes with Capacitor in Phase 7 — swap the `reminder.js` stub
    for `@capacitor/local-notifications` (recipe is in the file's comment block). Export
    likewise gets its real `Filesystem` + `Share` body then.
- **3 pre-existing lint warnings** (`set-state-in-effect` in Timeline/Calendar/EntryScreen) —
  want `useState(() => loadEntries())` instead of empty-init + effect. Clean up in Phase 6.
- **Phase 5.5 — Design handoff.** `design_handoff_plain_journal/` exists as a **styling
  reference only** (not used directly) — see decisions below for what's already been
  intentionally departed from.
- **Phase 6 — Visual polish.** Apply finalized design spec across all screens.
- **Phase 7 — Build & ship.** Add Capacitor + Android platform (deliberately deferred, see
  below), signed build, real device test, optional Play Store listing.
- **Naming decision.** Public-facing brand name still open (plan.md calls out Daily/Dear/Nook
  etc.); on-screen wordmark currently reads "Your Journal" per a deliberate departure below,
  separate from the locked package name `plain-journal` / app id `com.plainjournal.app`.

## Key decisions already made (don't relitigate these)

From project memory (`build-decisions.md`):

- **Build order:** web app first (Phases 2–6), wrap with Capacitor + Android only afterward.
  Do not install `@capacitor/preferences` or add the Android platform yet.
- **Storage:** own small module on raw `localStorage` (see `storage.js`), swap internals to
  Capacitor Preferences later.
- **Timestamp model:** single `ts` field (ISO local, minute precision), set once at creation,
  never changed by edits. This supersedes plan.md's `createdAt`/`updatedAt` pair.
- **Departures from the design handoff** (user's explicit call):
  - Wordmark is sans-serif, not the handoff's Playfair Display serif. (A user-opt-in serif
    toggle now exists — Georgia, app-wide — but sans is still the default, so this stands.)
  - Save button is outline-only (transparent, 1px `#DCDCDC` border, `#0a0a0a` text, 36px
    min-height), not the handoff's solid black pill / 48px tap target.
  - Entry screen date includes the year, unlike the handoff's masthead spec.
  - On-screen wordmark text is "Your Journal", not "Plain Journal" (package name unaffected).
- **Unresolved:** wordmark size conflict between handoff README (30/32) and
  `design_system/tokens/typography.css` (26/32) — ask the user before Phase 6 styling.

## Next concrete step

**The Phase 5 web-app is functionally complete.** No single obvious next task — candidates,
roughly in order of value:

1. **Phase 6 — Visual polish.** A proper design pass across all 5 screens (Entry, Timeline,
   Calendar, Settings, lock). Lots of ad-hoc styling has accumulated this session; time to
   make it cohere. Also where the 3 `set-state-in-effect` lint warnings get fixed. Needs the
   `design_handoff_plain_journal/` reference and the wordmark-size question settled (it's
   noted resolved — user's call — but confirm the number before a typography pass).
2. **Phase 7 — Capacitor + Android.** Wrap the web app, add the platform, make the daily
   reminder and the JSON export *real* (`@capacitor/local-notifications`,
   `Filesystem` + `Share`). Swap `storage.js` internals to `@capacitor/preferences`. This is
   the "web app first, then wrap" plan finally paying out.
3. **Calendar dot visual cue** — small, deferred polish item (clearer "this day has entries").

User has been verifying in-browser throughout. `git push` still pending for this session's
commits.

Wordmark size conflict is resolved (user's own explicit choice, not to be relitigated).

Per [CLAUDE.md](CLAUDE.md)'s teaching contract: pick up one phase/file at a time, explain
before writing, stop after each file for go-ahead. Per CLAUDE.md's progress-log rule: update
this file after each completed step/phase.
