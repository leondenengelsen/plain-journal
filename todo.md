# Plain Journal — Progress / Todo

Working status tracker, separate from [plan.md](plan.md) (the fixed spec/phase plan) and
[CLAUDE.md](CLAUDE.md) (process rules). Update this file as phases progress.

## Where we are

**Currently in Phase 3 (Timeline + Calendar) — Timeline, delete, and back-navigation done,
Calendar not started.**

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

## Not started yet

- **Favicon.** Currently Vite's default placeholder (`public/favicon.svg`). Needs to be
  replaced with some sort of pen icon, matching the journaling theme.
- **Phase 3 remainder — Calendar view.** No calendar component exists yet. Month grid, dot
  markers on days with entries, tap-to-jump into timeline for that day.
- **Phase 5 — Settings.** Currently just a placeholder (`<p>Settings — coming soon</p>` in
  App.jsx). Needs: JSON export, daily reminder toggle + time picker, About section. Still web
  app only at this point — real Filesystem/Share/Local Notifications plugins come after
  Capacitor is added (see Build order decision below).
  - **Dark mode switch.** Toggle that inverts background/text colors. User flagged that a
    naive color swap likely isn't enough — need to audit everything else that assumes a
    light background: the entry field's border (`rgba(10, 10, 10, 0.2)` in App.css, tuned for
    white), the muted greys (`#5c5c5c`, `#dcdcdc`), the confirm dialog's white sheet, and the
    two reds (`#c0392b`) for contrast/legibility on dark. Likely implemented as CSS custom
    properties (variables) for color values, swapped via a `data-theme` attribute or class on
    a root element, with the choice persisted in `storage.js`/localStorage.
  - **Serif font switch.** Toggle to switch the entry text (and/or whole app?) between the
    current sans-serif and a serif font. Note: the build-decisions memory already recorded a
    deliberate departure from the design handoff to remove serif entirely (wordmark changed
    from Playfair Display serif to sans) — this toggle would reintroduce serif as a
    user-chosen *option* rather than the default, which doesn't conflict with that decision
    but is worth keeping in mind. Need to pick/import an actual serif font (plan.md suggested
    Lora/Source Serif/Charter) and decide scope (just the writing surface, or wordmark/dates
    too) before building.
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
  - Wordmark is sans-serif, not the handoff's Playfair Display serif.
  - Save button is outline-only (transparent, 1px `#DCDCDC` border, `#0a0a0a` text, 36px
    min-height), not the handoff's solid black pill / 48px tap target.
  - Entry screen date includes the year, unlike the handoff's masthead spec.
  - On-screen wordmark text is "Your Journal", not "Plain Journal" (package name unaffected).
- **Unresolved:** wordmark size conflict between handoff README (30/32) and
  `design_system/tokens/typography.css` (26/32) — ask the user before Phase 6 styling.

## Next concrete step

Confirm current phase status with the user, then either:
1. Finish Phase 3 by building the Calendar view, or
2. Verify/finish the edit flow at `/entry/:id` (started ahead of schedule), or
3. Resolve the wordmark size conflict before starting Phase 6.

Per [CLAUDE.md](CLAUDE.md)'s teaching contract: pick up one phase/file at a time, explain
before writing, stop after each file for go-ahead.
