# Handoff: Plain Journal (Android journaling app)

## Overview

Plain Journal is a single-purpose mobile journaling app. It opens straight to a writing screen; everything else — a timeline of past entries, a month calendar, and settings — sits behind a hamburger menu in the top-right corner. There is no account, no tab bar, no streaks or counts. Four screens plus a full-screen entry editor.

This handoff bundles the design system authored for it (tokens, components, guidelines) and the interactive four-screen prototype.

## About the design files

The files in this bundle are **design references created in HTML** — prototypes that show intended look and behaviour. They are not production code to copy directly. The React components here are deliberately cosmetic: inline styles, CSS custom properties, no state layer, no persistence.

The task is to **recreate these designs in the target codebase's existing environment** (Jetpack Compose, React Native, Flutter, SwiftUI, web…) using its established patterns, component library, and theming. If no environment exists yet, choose the framework appropriate to the product — this is Android-first and mobile-only, so Jetpack Compose or React Native is the natural target — and implement the designs there.

## Fidelity

**High-fidelity.** Colours, type scale, spacing, radii, motion durations, and copy are final and exact. Recreate pixel-for-pixel using the target platform's primitives. Every numeric value in this document is authoritative; do not round or snap to a framework default. Where a value here differs from a platform library's default (Material's 4dp radii, 16sp body, ripple press feedback), **this document wins** — notably: press feedback is opacity, never a ripple, and there is no elevation anywhere except the menu popover.

Design width: **360dp**, mobile only. There is no tablet or desktop layout, and no dark mode in scope.

## Design tokens

Authoritative source: `design_system/styles.css` → `design_system/tokens/*.css`.

### Colour — monochrome, no brand accent

| Token | Value | Use |
| --- | --- | --- |
| `--ink-1` | `#0A0A0A` | All primary text, all icons, primary button fill, toggle-on track, calendar dot |
| `--ink-2` | `#5C5C5C` | Dates, times, helper text, secondary prose |
| `--ink-3` | `#8E8E8E` | Section labels, day-of-week headers, tertiary meta |
| `--ink-4` | `#B8B8B8` | Placeholder text only |
| `--paper` | `#FFFFFF` | Page background, everywhere, always |
| `--paper-sunk` | `#FAFAFA` | Row press fill (timeline rows only) |
| `--rule-1` | `#EDEDED` | Dividers |
| `--rule-2` | `#DCDCDC` | Input underline (rest), toggle-off track |
| `--signal-focus` | `#1B4FD8` | Keyboard focus ring where the platform needs one |
| `--signal-danger` | `#B3261E` | Destructive state (unused in these screens) |
| `--signal-ok` | `#1E7A46` | Confirm state (unused in these screens) |
| `--overlay-scrim` | `rgba(10,10,10,.32)` | Menu scrim |

Semantic aliases used in code: `--text-primary` (ink-1), `--text-secondary` (ink-2), `--text-tertiary` (ink-3), `--text-placeholder` (ink-4), `--text-inverse` (paper), `--surface-page` (paper), `--surface-sunk` (paper-sunk), `--surface-inverse` (ink-1), `--divider` (rule-1), `--border-input` (rule-2).

### Typography — two families, strictly divided

**Playfair Display 500** (high-contrast display serif) is used for exactly one thing: the "Plain Journal" wordmark at the top of the Entry screen, **30 / 32, weight 500, tracking 0, opacity 0.73**. It appears nowhere else — not in body text, buttons, labels, dates, or entry text.

Everything else is **Instrument Sans**, weights 400 / 500 / 600:

| Role | Size / line-height | Weight | Tracking |
| --- | --- | --- | --- |
| Display | 32 / 36 | 600 | -0.02em |
| Title (app bar) | 22 / 28 | 600 | -0.01em |
| **Entry text** | **18 / 30** | 400 | 0 |
| Wordmark (serif) | 30 / 32 | 500 | 0 |
| Body | 16 / 24 | 400 | 0 |
| Label (buttons, menu) | 15 / 20 | 500 | 0 |
| Caption (dates, helper) | 13 / 18 | 400 | 0.01em |
| Overline (section label) | 12 / 16 | 500 | 0.08em, uppercase |

Entry text is intentionally larger than any heading above it. No italics. Mono (`JetBrains Mono`) appears only in the design system's own specimen cards, never in the product.

Tokens: `--font-sans`, `--font-serif-display`, and `--text-wordmark-size` / `--text-wordmark-line` / `--text-wordmark-weight` / `--text-wordmark-tracking`.

**Font substitution flag:** no font binaries were supplied with the brief, which said "Inter, or similar". The system uses **Instrument Sans** and **Playfair Display** from Google Fonts. If the product has licensed faces, substitute them and keep the scale above unchanged.

### Spacing — 4px base

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64` (`--space-1`…`--space-16`).

Layout constants: screen gutter **20**, app bar height **56**, minimum tap target **48**, content max width **520** (centred on wide viewports).

### Shape, elevation, motion

- Radii: **0** for lists, rows, and single-line fields; **10** for the writing surface and the menu popover (6 available for smaller sheets); **999** (pill) for buttons and the toggle.
- Border: 1px hairline. **Separation is space first, a hairline second, never a shadow.**
- Shadows: exactly one exists — `--shadow-sheet: 0 8px 32px rgba(10,10,10,.10)`, used only by the menu popover. No inner shadows, no glows, no elevation on cards, bars, or buttons.
- No gradients, no blur, no imagery, no texture. The background is plain white on every screen including empty states.
- Durations: **120ms** state changes, **180ms** menu, **260ms** screen transitions. One easing curve: `cubic-bezier(.2, 0, 0, 1)`.
- Press: **opacity 0.55** on buttons and icon buttons; `#FAFAFA` background fill on tappable rows. Press never changes colour, never scales, never ripples.
- Hover (pointer environments only): opacity 0.6.
- Disabled: opacity 0.32. The Entry-screen hamburger sits at 0.37 and the wordmark at 0.73 by design — both are deliberately quieter than the writing surface.
- Focus: single-line input underline moves `#DCDCDC` → `#0A0A0A` over 120ms. The writing surface has no focus treatment because it is focused by default and already outlined.

## Screens / views

### 1. Entry (home — the launch screen, every time)

**Purpose:** write a new entry. Nothing else.

**Layout:** single column, `height: 100%`, four flex rows top to bottom:
1. Hamburger, **absolutely positioned** in the top-right corner (4 from the top, 8 from the right) so it floats over the masthead rather than pushing it down. 48×48 tap target around the `menu` glyph, drawn at 48×41 with **opacity 0.37** and offset 13 down / 16 in from the button's right edge — deliberately lighter and larger than a standard icon, so it recedes.
2. Masthead, centred, padding `16px 20px`: the wordmark **"Plain Journal"** in Playfair Display 500 at **30px** / 32 line-height with **opacity 0.73**, and 6px beneath it today's date — **"3 September"** (day + full month, no year) — at 13/18 `#5C5C5C`.
3. Writing surface, `flex: 1`, padding `0 20px 8px`. Multiline field filling the whole area, in a **1px `#0A0A0A` outline, 10px radius, 16px inner padding**, white fill. No underline, no counter, no toolbar. **Auto-focused on mount** so the keyboard is up immediately. Text 18/30 ink-1; placeholder **"Today..."** in `#B8B8B8`. Caret ink-1.
4. Footer, padding `16px 20px 32px`. Full-width primary pill "Save", 48 min-height, `#0A0A0A` fill, white 15/20 medium label. Disabled (opacity 0.32) while the field is empty or whitespace-only.

**Save behaviour:** prepends a new entry with the current timestamp, clears the field, and shows the word **"Saved"** — 13/18 `#5C5C5C`, centred, 12px above the button — which disappears after ~1.6s. No toast, no snackbar, no checkmark, no haptic celebration.

### 2. Menu (overlay, not a screen)

Opened by the hamburger, available from every screen. Scrim `rgba(10,10,10,.32)` over the full viewport; popover anchored top-right (8 from the top, 12 from the right), min-width 200, white, radius 10, `--shadow-sheet`, vertical padding 8. Three rows, each 48 min-height, padding `0 20px`, 12px gap between a 20px `#5C5C5C` glyph and a 15/20 label:

| Icon | Label |
| --- | --- |
| `list` | Timeline |
| `calendar` | Calendar |
| `settings` | Settings |

The current screen's label renders at weight 600. Tapping the scrim closes. Animation: scrim fades in 180ms; popover fades and rises 6px on the same curve. **This popover is the entire navigation model — there is no tab bar, bottom nav, or drawer anywhere in the product.**

### 3. Timeline

**Purpose:** read and reopen past entries.

App bar: title "Timeline" (22/28, 600), leading `arrow-left` (returns to Entry), trailing `menu`.

When arrived at from the calendar, a filter line sits under the bar: the day, 13/18 `#5C5C5C`, left at the 20px gutter, with a ghost "Show all" button right-aligned that clears the filter.

Scrollable list, reverse-chronological. Each row: padding `16px 20px`; first line is date 13/18 `#5C5C5C` and time 13/18 `#8E8E8E` separated by an 8px gap; second line is the entry text, 16/24 ink-1, **clamped to two lines**. A 1px `#EDEDED` divider between rows, **inset 20px on both sides** so it aligns with the text. No divider above the first or below the last row. No shadow, no border, no radius, no chevron, no thumbnail.

Date format: `3 September 2026` (day, full month, year). Time: 24-hour `08:14`. Never relative ("3 hrs ago").

Tapping a row opens the entry editor. Press state fills the row `#FAFAFA`.

Empty state: "No entries yet." — 16/24 `#8E8E8E`, padding `24px 20px`. No illustration.

### 4. Entry editor (full screen)

App bar: leading `arrow-left` only, **no title and no trailing action**. Under it, at the gutter, the entry's date 13/18 `#5C5C5C` and time `#8E8E8E`. Then the same outlined writing surface, pre-filled and immediately editable — there is no read-only mode and no lock. Footer: full-width primary "Save" (never disabled here). Saving returns to the Timeline. Entries stay editable forever; editing does not change the entry's timestamp.

### 5. Calendar

App bar: title "Calendar", leading `arrow-left`, trailing `menu`.

Month header: 20px `chevron-left` icon button, centred "September 2026" (15/20, 600), 20px `chevron-right` icon button, with 8px horizontal padding. Below it a 7-column grid, **Monday-first**, with single-letter day headers (M T W T F S S) at 13/18 `#8E8E8E` and 8px bottom padding.

Each day cell is 44 tall, a centred column with 3px gap: the number in a 30×30 circle (16px type), and beneath it a **4×4 dot** in `#0A0A0A` if that day has at least one entry, otherwise transparent (the space is always reserved so numbers never shift). The selected day's circle fills `#0A0A0A` with white text.

Leading blanks pad the first week. No week numbers, no colour coding, no entry previews, no month animation.

Under the grid, 24px down at the gutter: "Tap a day to see its entries." 13/18 `#8E8E8E`.

Tapping a day navigates to the Timeline filtered to that date.

### 6. Settings

App bar: title "Settings", leading `arrow-left`, trailing `menu`. Scrollable, padding `0 20px 32px`.

1. **Username** — single-line field. Caption label "Username" 13/18 `#5C5C5C` 8px above; input 16/24, 48 min-height, transparent, **no box** — only a 1px bottom border, `#DCDCDC` at rest and `#0A0A0A` on focus. Placeholder "Your name". Local only; no validation, no save button, no account.
2. **NOTIFICATIONS** (overline section label, 32px above it) — row "Daily reminder" 16/24 with a secondary line 13/18 `#5C5C5C` reading "A nudge to write, once a day" when on, "Off" when off; trailing toggle: 44×26 track, radius 999, `#DCDCDC` off / `#0A0A0A` on, 22×22 white knob, 2px inset, translating 18px over 180ms. When on, a divider appears and a second row "Time" shows a 24-hour time value right-aligned (16/24, ink-1) that opens the platform time picker. Default `21:00`.
3. **YOUR DATA** — full-width secondary button "Download my data": white fill, 1px `#DCDCDC` inset border, ink-1 label, pill, 48 min-height. Exports every entry as a JSON file (`plain-journal.json`). Helper line 8px below: "Every entry, as a JSON file on this device." 13/18 `#5C5C5C`.
4. **ABOUT** — static prose, 16/24 `#5C5C5C`, 12px below the label: "Plain Journal keeps a plain text record of your days. Entries stay on this device, stay editable, and are never counted, scored, or shared. There is no account to make." Then "Version 1.0" 13/18 `#8E8E8E`, 16px below.

Section groups are separated by 32px of space — never by boxes, cards, or filled panels.

## Interactions & behaviour

- **Launch** → Entry screen, field focused, keyboard up. The app never resumes to another screen.
- **Navigation** → hamburger popover only. Back arrows return to Entry (from Timeline / Calendar / Settings) or to Timeline (from the editor). No gestures beyond the platform back button, which should follow the same paths.
- **Save (new)** → prepend entry with current timestamp, clear field, show "Saved" for 1.6s, keep focus.
- **Save (edit)** → update text in place, keep the original timestamp, return to Timeline.
- **Calendar day tap** → Timeline filtered to that day, with a "Show all" affordance.
- **Multiple entries per day** are expected; each keeps its own timestamp and appears as its own row.
- **Transitions:** cross-fade or platform-standard push at 260ms on `cubic-bezier(.2,0,0,1)`. Nothing bounces, springs, scales, or staggers.
- **No** loading states, spinners, skeletons, or error states — everything is local. If persistence fails, prefer silence over a dialog.
- **Responsive:** single column; above 520px, centre the column at 520 and keep the white field of the page. No multi-pane layout.

## State management

Local device state only. No auth, no sync, no network.

```
entries: [{ id, ts /* ISO local, minute precision */, text }]   // persisted, reverse-chron by ts
draft: string                                                    // Entry screen, cleared on save
screen: 'entry' | 'timeline' | 'edit' | 'calendar' | 'settings'
menuOpen: boolean
editing: entryId | null
editDraft: string
dayFilter: Date | null                                           // set by calendar, cleared by "Show all"
username: string                                                 // persisted
reminderEnabled: boolean                                         // persisted; schedules a daily local notification
reminderTime: 'HH:MM'                                            // persisted, default '21:00'
savedFlash: boolean                                              // 1.6s, Entry screen only
```

Persistence: local store (Room / SQLite / AsyncStorage). The reminder should be a scheduled **local** notification; no push infrastructure. Export serialises the entries array to JSON and hands it to the platform share/save sheet.

## Assets

**None were supplied, and none were invented.**

- **No logo.** Nothing was drawn or approximated. The wordmark is the name "Plain Journal" set in **Playfair Display 500**, 30/32 at opacity 0.73 — used at the top of the Entry screen and wherever a mark would go. If a real mark exists, drop it in and replace those usages.
- **Icons: Lucide**, 24px, 2px stroke, no fill, always solid ink (`#0A0A0A`), or lighter via **opacity** (0.64 for secondary, 0.46 for tertiary) — never recoloured. The prototype loads them as flat SVGs from `https://unpkg.com/lucide-static@0.544.0/icons/<name>.svg`; in production, bundle the SVGs locally or use the platform Lucide package. Full inventory, seven glyphs: `menu`, `arrow-left`, `list`, `calendar`, `settings`, `chevron-left`, `chevron-right`. This is a substitution — flag it if the product has its own icon set.
- **No imagery, illustration, pattern, or texture** anywhere, by design.
- **Emoji are never used**, in UI or copy. Unicode characters are not used as icons.

## Copy rules

Sentence case everywhere (the 12px uppercase section labels are the only exception). Second person, used sparingly; the app never says "I". No exclamation marks, no emoji, no celebration. Verbs for actions ("Save", "Download my data", "Show all"), nouns for places ("Timeline", "Calendar", "Settings"). Empty states state the fact and stop. **Never add a count, streak, score, mood tag, or reward** — their absence is the product.

Use the strings in this document verbatim.

## Files

All paths relative to this handoff folder.

- `design_system/readme.md` — full design guide: content fundamentals, visual foundations, iconography, rules of thumb.
- `design_system/styles.css` + `design_system/tokens/*.css` — every token, authoritative values. Drop these straight into a web target, or transcribe them into the platform's theme.
- `design_system/guidelines/*.card.html` — foundation specimens: colour swatches, the type ladder, the wordmark serif, the spacing scale, radii, hairline-vs-shadow, motion, voice, iconography. Open any of them in a browser to see a value rendered rather than described.
- `prototype/index.html`, `prototype/README.md`, `prototype/data.js` — the prototype shell, its screen-by-screen notes, and the seeded entries plus date/time formatters.

**This document, plus `design_system/`, is the complete specification** — it is written to be implemented from the README alone.

The per-screen React sources and the component library (`Button`, `IconButton`, `Icon`, `TextInput`, `EntryField`, `Switch`, `Divider`, `SectionLabel`, `AppBar`, `MenuSheet`, `EntryCard`, `CalendarMonth`, `SettingRow`, `TimeField`) live in the Plain Journal design-system project, each with a `.d.ts` props contract and a `.prompt.md` usage note. They are deliberately not bundled here: they read components off a compiled bundle generated by the design-system tooling, so they would not run standalone, and every value they encode is already written out above. Ask the designer for the design-system export if you want to read them.

## Open questions for the team

1. Are there licensed faces? (Instrument Sans for UI and Playfair Display for the wordmark are both stand-ins, chosen to match a supplied reference image.)
2. Is there a logo, app icon, or existing icon set? (Lucide is a stand-in; no mark was supplied.)
3. Dark mode: out of scope here — confirm it is out of scope for v1, since a monochrome-on-white system needs a deliberate inversion, not an automatic one.
4. Entry deletion is not in the brief and not designed. Confirm whether v1 ships without it.
