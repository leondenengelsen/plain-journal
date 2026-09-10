# Plain Journal — Progress / Todo

Working status tracker, separate from [plan.md](plan.md) (the fixed spec/phase plan) and
[CLAUDE.md](CLAUDE.md) (process rules). Update this file as phases progress.

## Where we are

**Phase 3 + Phase 5 web-app COMPLETE. Now in an open-ended styling / Phase-6 phase — the user
is iterating on look-and-feel live in the browser, lots of small back-and-forth.**

Phase 5 features (all done as a web app): entry / timeline / calendar / editing / delete /
export / import / daily-reminder-stub / About / reset / dark mode / serif font / favicon /
PIN lock. Dark mode = a sun/moon `ThemeToggle` icon button in Settings > Appearance; font =
a "Sans"/"Serif" `.settings-button` in the same section. PIN lock = 4-digit, opt-in from
Settings > Privacy, `<PinSetup>` in a `<BottomSheet>`, launch lock screen. Shared
`BottomSheet` component (ConfirmDialog + PinSetup use it).

**Header system (this session):** all screens share one `.app-header` flex row —
`min-height: 40px`, `padding: 8px 0`, `position: relative`. The hamburger's top edge is
identical (28px in-browser) on every screen, so it never jumps when navigating. Entry and
Settings put their heading text (`.app-header-title`: `position:absolute; left:50%;
translateX(-50%)`, `max-width: calc(100% - 120px)` + ellipsis so it can't collide with the
hamburger on narrow screens) centred in that row — "Your Journal" 34px, "Settings" 28px.
Timeline keeps calendar-button-left / hamburger-right; Calendar has hamburger only
(`app-header--end`). `.masthead` class is GONE. `.today` is now standalone (centred, its own
margin). The book-logo image + `Wordmark.jsx` component were built then **fully reverted** —
user didn't like it; wordmark is plain "Your Journal" text again, no logo files.

User is styling/verifying in the browser throughout. See below.**

## Session log

- **2026-09-09 (cont.) — Capacitor wrap, Part 0 steps 1–5 DONE.** On branch `capacitor`.
  Following [ship.md](ship.md) Part 0 one step at a time.
  - Env verified: Node 22.14, JDK 21, Android SDK has API 35 + 36, build-tools 36,
    Android Studio present. AVDs: `Pixel_2_API_34`, `Pixel_8_Pro_API_34`.
  - Installed `@capacitor/core` + `@capacitor/android` (deps), `@capacitor/cli` (devDep),
    all `^8.5.1`. The 3 `npm audit` "moderate" warnings are all `uuid`←`xcode`←
    `@capacitor/cli` — iOS-only code path, never runs for Android. Left as-is (fixing =
    downgrade). 
  - `npx cap init "Plain Journal" com.plainjournal.app --web-dir=dist` → created
    **`capacitor.config.json`** (JSON not `.ts` — this is a plain-JS project, no
    TypeScript; ship.md updated to say so). `appId` is permanent once published; `appName`
    is just a seed (real source of truth after scaffold is `android/.../strings.xml`);
    `webDir: dist` is the Vite build output that gets copied into the WebView.
  - `npm run build && npx cap add android` → generated `android/` (a full Gradle/Android
    Studio project, 53 files tracked; `build/`, `.gradle/`, `local.properties`,
    `assets/public/`, and the copied config JSONs are correctly gitignored by Capacitor's
    `android/.gitignore`). `MainActivity.java` is 5 lines (`extends BridgeActivity` — the
    whole native app is a WebView loading `dist/index.html`). `variables.gradle` already
    has `targetSdkVersion = 36` / `compileSdkVersion = 36` → **already meets the Play
    "new apps target API 36" rule; no manual bump needed** (ship.md's step 2 note is moot).
    `AndroidManifest.xml` already wires a `FileProvider` (`${applicationId}.fileprovider`,
    paths in `xml/file_paths.xml`) — pre-set for the export/share step. Only permission so
    far: `INTERNET`.
  - **AGP mismatch hit + resolved:** Capacitor 8 pins AGP 8.13 / Gradle 8.14.3; the
    installed Android Studio was **2024.1** (max AGP 8.6). Fix chosen (user): **updated
    Android Studio to 2026.1.4 "Quail 4"** (stable). No project downgrades. Gradle sync
    passes after the update.
  - **Step 5 verified in the emulator (user confirmed "all works"):** app launches, entry
    → save → timeline works, calendar dot, dark mode + serif toggle, entries persist
    across app restart (WebView `localStorage`), PIN lock gates entry. Expected NOT to
    work yet: daily reminder (still the `console.info` stub) and export (the `<a download>`
    trick doesn't work in a WebView) — those are steps 7 + 8.
  - **Step 6 — `storage.js` → `@capacitor/preferences` — DONE + VERIFIED ON DEVICE
    (2026-09-10).** Emulator: cleared the app cache (Android Settings → Apps → Storage →
    Clear cache), reopened, **entries survived** — proves data is in native
    SharedPreferences, not the WebView storage a cache wipe would have destroyed. Chose the
    "async storage + update callers" approach (not an in-memory cache). Installed
    `@capacitor/preferences`
    `^8.0.1`; `cap sync` picked it up (updated `android/app/capacitor.build.gradle` +
    `capacitor.settings.gradle`). `npm run lint` + `npm run build` clean.
    - `storage.js`: added `Preferences` import + two private helpers `readKey`/`writeKey`
      (unwrap the `{ value }` object, JSON.stringify on write). Every storage-touching fn
      is now `async`: `loadEntries`, `saveEntries`, `deleteEntry`, `clearAllEntries`,
      `entriesAsJSON`, `mergeImportedEntries`, `loadSettings`, `saveSettings`. Pure fns
      unchanged: `formatLocalTimestamp`, `sortEntriesNewestFirst`, `isValidEntry`. Keys
      unchanged but **data does NOT migrate** — old entries were in WebView localStorage,
      Preferences (native SharedPreferences) starts empty. Export real entries first if any
      exist on an installed build.
    - Callers updated with the "async fn inside useEffect" pattern:
      - `Timeline.jsx`: `useState(null)` (null = loading), early-return header-only shell
        while null, `async load()` in the effect.
      - `Calendar.jsx`: kept `useState(new Set())` (empty = no dots, harmless intermediate),
        `async loadMarks()` in the effect.
      - `EntryCard.jsx`: `handleConfirm` → `async`, `await deleteEntry`.
      - `EntryScreen.jsx`: load effect → `async loadExisting()` with early `if (!id) return`;
        `handleSave` → `async`, `await saveEntries` before `navigate('/')`.
      - `Settings.jsx`: **`useState(loadSettings)` lazy-init removed** (can't await in lazy
        init) → `useState(null)` + `async load()` effect + `settings === null` early return.
        `apply` → `async` (`setSettings` first for instant UI, then `await saveSettings`).
        `handleResetConfirm` → `async`. `handleImportFile` already awaited
        `mergeImportedEntries`, no change. `font`/`pinOn` still sync lazy-init — `loadFont`
        (font.js) and `hasPin` (lock.js) still read `localStorage` directly; migrating
        those is a separate low-stakes call, deferred.
      - `export.js`: minimal change only (`async` + `await entriesAsJSON()`) — the
        `<a download>` body still doesn't work in a WebView; **step 8 rewrites this file**
        with `Filesystem` + `Share`. `Settings.jsx` `onClick={downloadEntriesJSON}` left
        as fire-and-forget for now.
    - Verified: cleared app cache on the emulator, entries survived (see the DONE line
      above).
    - Lint note: the 3 old `set-state-in-effect` warnings don't appear under the current
      `oxlint` 1.81 — either resolved by this refactor or not flagged by this version.
  - **App icon (out of ship.md order, done alongside step 6).** User provided a book+leaf
    line-art logo. Final source: `plain-journal/assets/icon.png` (1024×1024, transparent,
    black mark). Installed `@capacitor/assets` `^3.0.5` (devDep); ran
    `npx capacitor-assets generate` → all Android launcher densities (adaptive + legacy +
    round), background `#FFFFFF` white, foreground inset 16.7%, plus regenerated splash
    screens (book on white). Cleaned up what the generator also emitted but this app
    doesn't use: reverted a cosmetic `AndroidManifest.xml` whitespace reformat, deleted the
    PWA `icons/` folder + `public/manifest.webmanifest`, removed 3 loose logo PNGs from
    `public/`. **Known imperfection:** the source mark sits low in the frame, so the
    adaptive foreground looks slightly below-center under a circular mask. Fix later:
    re-export `assets/icon.png` centered (~60-65% size, even margin), re-run
    `npx capacitor-assets generate`, `npx cap sync android`. Play Store 512×512 icon:
    resize the 1024 master when we reach ship.md step 1d.
  - **Step 7 — `reminder.js` → `@capacitor/local-notifications` — DONE + VERIFIED ON DEVICE
    (2026-09-10).** Real daily reminder that fires with the app closed (banner + custom
    sound confirmed on the emulator). Installed `@capacitor/local-notifications` `^8.3.1`;
    `cap sync` links its native code + merges its manifest (adds `POST_NOTIFICATIONS`,
    `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`, receivers/provider — all
    via the plugin's own AndroidManifest, our app manifest is untouched).
    - `reminder.js` rewritten:
      - `initReminders()` — creates the notification channel `'daily-reminder'`,
        `importance: 5` (HIGH = heads-up banner), `visibility: 1`, `sound: 'reminder_sound'`.
        Called fire-and-forget from `main.jsx` at startup. Idempotent, no-op on web.
        **Channel props (importance + sound) are LOCKED at first creation** — changing them
        in code later only affects fresh installs / after "Clear storage". This bit us
        during testing: had to clear app storage to hear the new sound.
      - `scheduleDailyReminder(time)` — `await requestPermissions()`; returns
        `{ ok: false, reason: 'denied' }` if not granted, else cancels any existing
        (fixed id `1`) and schedules `{ on: { hour, minute }, repeats: true,
        allowWhileIdle: true }`. **Inexact on purpose** — "around 20:00" is fine for a
        daily nudge and avoids leaning on `SCHEDULE_EXACT_ALARM` (Play-restricted).
      - `cancelDailyReminder()` — cancels id 1.
      - `sendTestNotification()` — kept, exported, unused in UI. Fires a one-off 5s out.
        Emulators don't reliably fire *scheduled* repeating notifications, so this is how
        we verified the pipeline. Call from console or a temp button when testing.
    - `Settings.jsx`: `apply()` now `await`s `scheduleDailyReminder` and branches on the
      result — on `denied` it reverts `reminderEnabled` to false (+ persists) so the toggle
      can't sit "on" while nothing's scheduled, and sets `reminderDenied` state → shows a
      red `.settings-error` telling the user to enable notifications in system settings.
      Reminder-section hint text updated from "aren't active yet" to
      "A gentle nudge at the time you pick, even when the app is closed."
      **Also (user request):** reordered Settings sections so **Daily reminder is first**,
      Your data (Export/Import) moved down. New order: Daily reminder → Appearance →
      Privacy → Your data → About → Danger zone.
    - Custom sound: `notification 2-OneShot2.wav` (16-bit PCM, 48kHz, 2.36s) → copied to
      `android/app/src/main/res/raw/reminder_sound.wav` (Android raw resources: bare
      filename, no extension, lowercase). Set on the channel + every notification.
    - Version bump (user request): About text, `package.json`, and
      `android/app/build.gradle` `versionName` all → **1.0.0** (`versionCode` stays 1).
    - Tried + reverted: a small book-mark logo in the Entry-screen header top-left
      (`public/logo-mark.png` + `.entry-logo-mark` CSS + an `<img>` in EntryScreen). User
      didn't want it. Fully removed.
    - `main.jsx`: added `import { initReminders }` + a fire-and-forget `initReminders()`
      call alongside `applyTheme`/`applyFont`.
    - Lint + build + sync clean throughout.
  - **Step 8 — `export.js` → `@capacitor/filesystem` + `@capacitor/share` — DONE + VERIFIED
    ON DEVICE (2026-09-10).** Export now writes the entries JSON to `Directory.Cache` and
    hands the file URI to the Android share sheet (save to Files/Drive/email/etc.) — the
    `<a download>` browser trick doesn't work in a WebView. Verified on the emulator: share
    sheet appears, exported file is valid JSON.
    - `export.js` full rewrite: `downloadEntriesJSON()` → `exportEntries()` (native-only —
      `@capacitor/share` has no desktop-web file fallback, and we test on the emulator).
      `Filesystem.writeFile({ directory: Directory.Cache, encoding: Encoding.UTF8 })` →
      `Share.share({ url: uri, title, dialogTitle })`. Returns `{ ok, cancelled?, message? }`;
      catches the plugin's `'Share canceled'` throw as a non-error (user backed out).
      Filename `your-journal-YYYY-MM-DD.json`. Uses the FileProvider already in the manifest
      from `cap add android`.
    - `Settings.jsx`: `importResult` state → `dataResult` (Export + Import share it, same
      `{ ok, message }` shape, only one runs at a time). New `handleExport()` — silent on
      cancel, shows a hint otherwise. Button `onClick` → `handleExport`. Copy "Download
      every entry" → "Save every entry".
    - **Fixed a latent bug:** `mergeImportedEntries(text)` in `handleImportFile` was missing
      `await` since the Step 6 storage migration — now awaited.
    - Plugins: `@capacitor/filesystem@8.1.3`, `@capacitor/share@8.0.1`. **4 native plugins
      total** (preferences, local-notifications, filesystem, share).
  - **ship.md Part 0 (Capacitor wrap + make the stubs real) — COMPLETE.** The app works
    fully as a native Android app: native storage, real closed-app notifications, native
    export. Steps 1–8 all verified on the emulator.
  - **On-device fixes from real-phone testing (2026-09-10). App confirmed working on the
    user's physical Android phone.**
    - **Import was broken on-device** — `<input type="file">` + `FileReader` (and
      `Blob.text()`) both throw `NotReadableError` ("The requested file could not be read")
      on the `content://` URI Android's picker returns; a known Chromium WebView limit.
      Fix: added **`@capawesome/capacitor-file-picker@8.1.0`**. `export.js` gained
      `pickEntriesFileText()` — `FilePicker.pickFiles({ types: ['application/json'],
      limit: 1 })` returns a native `path`, then `Filesystem.readFile({ path, encoding:
      UTF8 })` reads it. No manifest permission needed (SAF picker grants per-file access).
      `Settings.jsx`: hidden `<input>` / `fileInputRef` / `useRef` / `readFileAsText` all
      removed; `handleImportFile(e)` → `handleImport()`.
    - **App name under the launcher icon** was "Plain Journal" → changed
      `android/.../res/values/strings.xml` `app_name` + `title_activity_main` to
      **"Your Journal"** (and `capacitor.config.json` `appName`). `package_name` /
      `custom_url_scheme` / appId stay `com.plainjournal.app` (permanent).
    - **Status bar** (clock/battery strip) didn't match the app. On API 36 the system
      forces edge-to-edge: no settable status-bar background, WebView draws under a
      transparent bar. Fix: **`@capacitor/status-bar@8.0.3`**; `theme.js` `syncStatusBar()`
      sets only the **icon style** (`Style.Light` = dark icons on our white bg,
      `Style.Dark` = light icons on `#141414`), called from `applyTheme()` so it flips with
      the theme toggle; native-guarded. `index.html` got `viewport-fit=cover`. `App.css`
      `.app` + `.lock-screen` now pad by `env(safe-area-inset-top/bottom)`; `.entry-screen`
      height calc updated to subtract the insets so it still never scrolls. Net effect: the
      status-bar strip shows the app's own bg colour and the header clears it.
    - Removed the "A gentle nudge at the time you pick…" hint under the Daily reminder
      toggle (user request).
    - About section: added a first line "By writing a couple of words every night, we
      reflect and learn." above the app-description paragraph ("…no-strings-attached
      journalling app by Leon den Engelsen."). New `.settings-about + .settings-about`
      12px gap rule in App.css.
    - **6 native plugins now:** preferences, local-notifications, filesystem, share,
      status-bar, file-picker.
  - **Next:** step 9 — full on-device verification pass (walk every screen, dark mode,
    serif, PIN; the reminder actually firing at a set time is worth confirming on real
    hardware). Then **ship.md Part 1 — Google Play:** create the developer account (**$25 +
    mandatory government-ID verification — start early, it's slow**), generate the signing
    keystore (back it up — losing it = can never update the app), build a signed `.aab`
    (`./gradlew bundleRelease`), and kick off the **12-tester / 14-day closed test** (the
    long pole — that clock can't be compressed). Also needs a one-paragraph privacy-policy
    page hosted somewhere (required even with zero data collection). Full detail: ship.md.

- **2026-09-09 — button audit + shipping plan (docs only, no app code).**
  - Ran a full button-consistency audit of `plain-journal/src/` (all 21 buttons/clickables).
    Plan-only, per user ("just tell me what's inconsistent"). Findings + the "calm
    reference" recommendation (= the Save button) + a proposed CSS-variable token set
    written to `~/.claude/plans/what-buttons-are-not-moonlit-crown.md`. Summarised in the
    Phase 6 bullet below. No CSS changed.
  - Wrote [ship.md](ship.md) — the full Phase 7 store-publishing guide (Capacitor wrap →
    Google Play → Apple App Store), after the user said they want to start on Capacitor and
    ship a "totally free" app to both stores. Condensed into the Phase 7 bullet below.
    Decisions: Google Play is the active track ($25 one-time); **iOS deferred** — user has a
    Mac but the Apple Developer Program $99/yr is a blocker, so it's a documented future
    phase, not near-term.
  - User made a one-line copy edit to the About text in
    [Settings.jsx](plain-journal/src/Settings.jsx) ("Plain Journal, a totally free…" →
    "Plain Journal is a totally free…"). Committed alongside.

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
- **Favicon.** [public/favicon.svg](plain-journal/public/favicon.svg) — first a hand-drawn
  pen/nib, then swapped (user's call) for the **Heroicons solid `PencilIcon`** path, `#0a0a0a`
  fill, `viewBox 0 0 24 24`. [index.html](plain-journal/index.html) `<title>` changed
  `plain-journal` -> `Your Journal` (package name in package.json untouched).
- **Hamburger dropdown — native flat list.** Was three outlined boxes; now a proper menu:
  `.menu-panel` is `overflow: hidden`, rounded (`14px`), soft shadow, no gaps; `.menu-panel a`
  are full-width rows (`padding: 20px`, `font-size: 17px`, `min-width: 220px` -> ~60px tall
  for a good tap target), `a + a` gets a `border-top: var(--color-border-faint)` hairline,
  `:active` / `@media (hover:hover) :hover` highlight with `--color-fill-subtle`.
  `letter-spacing: normal` on the links — `.entry-screen` sets `0.2rem` and it was bleeding in.
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
- **Phase 6 — Visual polish. IN PROGRESS (informally).** No formal design spec is being
  applied — the user is iterating live in the browser and driving each change ("bigger",
  "more native", "revert that"). Done so far: shared header system, native dropdown, favicon.
  Still loose / worth a consolidation pass eventually: button-tier naming (`.save-button` /
  `.settings-button` / `.confirm-button` / menu links all differ), the type scale, dark-mode
  QA on every screen (lock screen + sheets especially), the 3 `set-state-in-effect` warnings.
  - **Button consistency audit — DONE (2026-09-09), plan-only.** Full inventory of all 21
    buttons/clickables + inconsistency list + token proposal written to
    `~/.claude/plans/what-buttons-are-not-moonlit-crown.md`. Findings: 5 different
    border-radii on button-like things (the clear one: `.settings-button` `8px` vs Save +
    ConfirmDialog `999px`); two "Cancel" buttons styled differently (ConfirmDialog filled-grey
    vs PIN-setup outline); sizes/font-sizes not on a scale; danger styled two ways (outline
    vs filled accent); `.calendar-nav button` styled by tag not class; icon buttons have no
    consistent tap box (icons 20–40px); **biggest gap: no `:focus-visible` anywhere** (a11y),
    `:hover`/`:active` only on the dropdown, no `cursor:pointer`. Recommended "calm reference"
    = the **Save button** (`.save-button`: transparent bg, 1px border, `999px`, 15/500).
    Proposed token set: 4px spacing scale, 3 radii, control-height / tap-target / icon-size
    tokens, a `--focus-ring` token, button-role aliases — all in `index.css` `:root`, no new
    dark-mode overrides needed. Open decision deferred to a later session: shared `.btn` class
    vs `<Button>` component, and whether to tokenise font-size steps. **No code written.**
- **Phase 7 — Build & ship. Full step-by-step in [ship.md](ship.md)** (written 2026-09-09).
  Short version:
  - **Part 0 — Capacitor wrap (do first).** `npm i @capacitor/core -D @capacitor/cli` +
    `@capacitor/android`; `npx cap init "Plain Journal" com.plainjournal.app --web-dir=dist`
    (app ID is **permanent** once published); `npm run build && npx cap add android` →
    generates the `android/` Gradle project (checked into git). Repeat-forever cycle:
    `npm run build && npx cap sync android`. Then swap `storage.js` internals to
    `@capacitor/preferences`, and make the two stubs real:
    `@capacitor/local-notifications` (reminder.js — recipe in its comments) and
    `@capacitor/filesystem` + `@capacitor/share` (export.js — native share sheet). Call
    sites don't change. Per CLAUDE.md teaching contract: one file at a time, explain
    `capacitor.config.ts` don't skip it.
  - **"Totally free" — the real cost picture:**
    - *For users:* already true — no ads, no IAP, no accounts, no tracking, data on-device.
      You just *declare* it in the listings (Free pricing, "no data collected" forms).
    - *To publish:* **Google Play = $25 one-time**, then free forever. **Apple = $99/year,
      recurring** — no way to publish to the App Store without the paid Apple Developer
      Program (a free Apple account only builds to your own devices). Keystore/signing =
      free. Privacy-policy hosting = free (a static page).
  - **Google Play (active track):**
    1. Create Play Developer account, pay $25, **pass mandatory government-ID verification**
       (1–2 days — start early). Personal account type.
    2. Release build: set `versionCode`/`versionName`, `targetSdkVersion 36`
       (**new apps must target Android 16 / API 36 from 31 Aug 2026**), real launcher
       icons (`@capacitor/assets` from a 1024px png — favicon pencil is a starting point),
       `app_name` in `strings.xml`.
    3. **Generate an upload keystore** (`keytool -genkey … -keystore plain-journal-upload.keystore`)
       — losing it = can never update the app; back it up offline + password manager.
       Keep it + `keystore.properties` **git-ignored**. Enable Play App Signing.
    4. Build the AAB: `cd android && ./gradlew bundleRelease` → `app-release.aab`.
    5. **Closed testing gate (personal accounts, post-Nov-2023):** 12+ testers opted in
       **continuously 14+ days** and actually using the app, *before* production access.
       Adds 2+ weeks you can't compress — start this early.
    6. Store listing: name, short/full description, 512px icon, 1024×500 feature graphic,
       2+ phone screenshots (from emulator), category (Lifestyle/Productivity), content
       rating (Everyone), **privacy policy URL (required even with zero data collection —
       host a one-paragraph static page)**, data-safety form = "no data collected/shared",
       ads = none, pricing = Free (irreversible).
    7. Upload AAB to Production, complete the Console checklist, submit. First review ~days
       to a week.
  - **Apple App Store — FUTURE, blocked on the $99/yr fee.** You have a Mac (tooling is
    fine) but not committing to the yearly cost yet. When/if: `npm i @capacitor/ios` +
    `npx cap add ios` → Xcode project; set bundle ID `com.plainjournal.app`; sign via the
    Developer account; App Store Connect record → **App Privacy questionnaire ("nutrition
    label") = Data Not Collected** (required to submit), Free pricing, iOS screenshots from
    the Simulator, age rating 4+, export-compliance = exempt encryption (the SHA-256 PIN
    hash). Product → Archive → upload → submit. Recurring: $99/yr or the app is pulled;
    ~yearly forced rebuilds against new Xcode/SDK. Full detail = ship.md Part 2.
  - **Suggested order:** Part 0 (wrap + stubs + Preferences) → create Play account & start
    ID verification now → start the 12-tester/14-day closed test early → write privacy
    policy + listing assets during the test → submit to production → iOS only after Android
    is live and only if the $99/yr is worth it.
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

**The user has signalled they want to move to Capacitor / shipping** (2026-09-09). Target:
"totally free" app on **Google Play + Apple App Store**. Full guide written to
[ship.md](ship.md); condensed into the Phase 7 bullet above. Decisions captured that
session:
- **Google Play is the active track** ($25 one-time). **iOS is a documented FUTURE phase,
  blocked on the Apple Developer Program $99/yr** — user has a Mac but the recurring fee
  is a problem, so don't treat iOS as near-term.
- "Totally free" = free for users (already true: no ads/IAP/accounts/tracking) **and**
  cheapest path to publish.
- Pick up Phase 7 by starting **ship.md Part 0** (Capacitor wrap) one file at a time per
  the teaching contract — `capacitor.config.ts` gets explained, not skipped.

Still open / not blocking Phase 7:
1. **Button consolidation pass** — scoped by the button audit above / the plan file
   (`~/.claude/plans/what-buttons-are-not-moonlit-crown.md`). A separate planning session
   (shared-class vs component, file-by-file sequence) should precede any code. Could be
   done before *or* after the Capacitor wrap — independent of it.
2. **Type scale + dark-mode QA every screen** (lock screen + bottom sheets especially),
   fix the 3 `set-state-in-effect` warnings.
3. **Calendar dot visual cue** — small deferred item.

Wordmark size conflict is resolved (user's own explicit choice, not to be relitigated).

Per [CLAUDE.md](CLAUDE.md)'s teaching contract: pick up one phase/file at a time, explain
before writing, stop after each file for go-ahead. Per CLAUDE.md's progress-log rule: update
this file after each completed step/phase.
