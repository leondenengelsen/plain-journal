# Plain Journal — Progress / Todo

Working status tracker, separate from [plan.md](plan.md) (the fixed spec/phase plan) and
[CLAUDE.md](CLAUDE.md) (process rules). Update this file as phases progress.

## Where we are

**Phase 3 (Timeline + Calendar) functionally complete. Phase 5 (Settings) built as a web app:
export/import + About + reset are real, daily reminder is real UI wired to a deliberate stub
(needs Capacitor). Dark mode + serif-font toggles done. Pen favicon done. PIN lock is
HALF-DONE — the gate + lock screen + setup component exist and the app IS gated when a PIN
hash is present, but Settings has no Privacy section yet so there is currently NO WAY for a
user to set a PIN. Next session: wire PinSetup into Settings (step 6) + add lock CSS (step 7).
See below.**

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
  - [Settings.jsx](plain-journal/src/Settings.jsx): new "Appearance" section (placed first)
    with a "Dark mode" checkbox. Own `theme` state + `toggleTheme` (setState + applyTheme +
    saveTheme), deliberately NOT routed through the reminder `apply()` helper.
  - Two bug fixes found in dark mode: `.hamburger-icon` had no `color` so its
    `currentColor` Heroicon stayed dark — set `color: var(--color-text)`. `.menu-panel` had
    no `z-index` so Settings section content painted over the open dropdown — added
    `z-index: 10`.
- **Serif font toggle.** Same pattern as dark mode, independent attribute:
  - [index.css](plain-journal/src/index.css): `--font-family` token, default
    `system-ui, sans-serif`; `:root[data-theme-font='serif']` -> `Georgia, 'Times New
    Roman', serif`. `:root` font declaration now `var(--font-family)`. Works app-wide with
    no per-element CSS because every component already inherits the font from `:root`
    (`.wordmark { font-family: inherit }`, `.entry-field { font: inherit }`, etc.).
  - [font.js](plain-journal/src/font.js): `loadFont`/`saveFont`/`applyFont`, key
    `plain-journal:font`, sets `<html data-theme-font="serif">`.
  - [main.jsx](plain-journal/src/main.jsx): `applyFont(loadFont())` alongside the theme.
  - [Settings.jsx](plain-journal/src/Settings.jsx): "Serif font" checkbox, second row in
    Appearance. `font` state + `toggleFont`.
  - Decisions (user, 2026-09-08): **Georgia** (system font, no webfont bundle), scope =
    **entire app** (not just the writing surface — and app-wide is actually less code here).
    `data-theme-font` is separate from `data-theme` so dark/serif are orthogonal.
  - `theme.js` + `font.js` are a near-duplicated pattern; fine at 2, generalise to one
    `preference.js` helper only if a 3rd display pref appears.
- **PIN lock — HALF-DONE (steps 1–5 of 7).** Decisions (user, 2026-09-08): a **4-digit PIN**
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
  - **NOT DONE — next session:**
    - **Step 6:** wire `<PinSetup>` into `Settings.jsx`. New "Privacy" section: a "Require a
      PIN" checkbox; toggling on (when no PIN) or off (when PIN set) opens `<PinSetup>`
      inline; `onDone` updates the toggle state, `onCancel` reverts it. Plus the honest
      "casual lock, not a vault; no PIN recovery except clearing app data (which wipes
      entries)" hint text. **Until this ships there is no way for a user to set a PIN**, so
      the gate never triggers.
    - **Step 7:** `App.css` — `.lock-screen`, `.lock-title`, `.lock-dots`, `.lock-dot` /
      `.lock-dot-filled`, `.lock-pad` (3-col grid), `.lock-key`, `.pin-pad-wrap`,
      `.pin-setup`. None of these exist yet — the lock screen and PinPad currently render
      unstyled. Use the `var(--color-*)` tokens.
  - `npm run lint` + `npm run build` clean after steps 1–5.

## Not started yet

- **Calendar dot visual cue — revisit.** User flagged (2026-09-08) wanting a clearer visual
  cue for which days have entries; current small red dot may not be enough (bigger dot, filled
  background, count, etc. all still on the table). Explicitly deferred — logged now, address
  later, not urgent.
- **Phase 5 — Settings.** Core screen (export / import / reminder / About / reset) + dark
  mode + serif toggle + favicon all DONE as a web app — see "Done" above. Remaining Phase 5
  sub-items still open:
  - **Real daily reminder.** Comes with Capacitor in Phase 7 — swap the `reminder.js` stub
    for `@capacitor/local-notifications` (recipe is in the file's comment block). Export
    likewise gets its real `Filesystem` + `Share` body then.
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

**Finish the PIN lock — steps 6 and 7** (see the "PIN lock — HALF-DONE" entry under Done for
full detail). Step 6: add a "Privacy" section to `Settings.jsx` that wires in `<PinSetup>` so
a user can actually set/remove a PIN. Step 7: add all the `.lock-*` / `.pin-*` CSS to
`App.css` — the lock screen and number pad render completely unstyled right now. Until step 6
ships, the gate never triggers (no PIN can be set).

After that: user-verify everything in-browser (dark mode, serif, export/import, reset, PIN
lock — user is doing this themselves), then candidates are calendar-dot polish, Phase 6
(visual polish + the 3 `set-state-in-effect` lint fixes), or Phase 7 (Capacitor — makes the
reminder + export real).

Wordmark size conflict is resolved (user's own explicit choice, not to be relitigated).

Per [CLAUDE.md](CLAUDE.md)'s teaching contract: pick up one phase/file at a time, explain
before writing, stop after each file for go-ahead. Per CLAUDE.md's progress-log rule: update
this file after each completed step/phase.
