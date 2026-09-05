# Plain Journal Design System

Plain Journal is a single-purpose Android journaling app: open it, write, save. One product, one surface, no marketing site, no web app, no dashboard.

The whole design brief fits in a sentence — plain white page, black type, generous space, a large auto-focused writing field in a hairline-outlined box, one Save button, and a hamburger menu that leads to Timeline, Calendar, and Settings. Everything in this system exists to keep that restraint enforceable.

## Sources

No codebase, Figma file, deck, or brand assets were supplied. The system was authored from the written product brief in the project's opening message, which specified the four screens (Entry, Timeline, Calendar, Settings), the navigation model (hamburger only, no tab bar), and the aesthetic ("extremely minimal, calm and uncluttered; plain white background; clean modern sans-serif; black typography on white"). Every value here is an authored decision, not a recovered one — if a real repository or Figma file exists, attach it and this system should be reconciled against it.

- **No logo was provided.** Nothing has been drawn or invented. Wherever a mark would go, the name is set in Playfair Display 500 (`guidelines/brand-wordmark.card.html`).
- **Font substitution.** No font binaries were supplied. The brief said "Inter, or similar", so the system uses **Instrument Sans** from Google Fonts — a neutral grotesque with slightly warmer, less mechanical letterforms than Inter, which suits a calm writing app — paired with **Playfair Display** for the wordmark alone. `tokens/fonts.css` loads it over the network; swap it for local `@font-face` files if the real UI font is provided.
- **Icon substitution.** No icon assets were supplied. The system uses **Lucide** (24px, 2px stroke) from the pinned `lucide-static` CDN, masked so glyphs inherit token colours. Five glyphs cover the entire app.

## Content fundamentals

Plain Journal talks the way a paper notebook would if it talked: rarely, briefly, and without enthusiasm.

- **Sentence case everywhere.** "Download my data", not "Download My Data". The single exception is the 12px uppercase section label ("NOTIFICATIONS", "YOUR DATA", "ABOUT").
- **Second person, and only when needed.** "Your data", "Every entry, as a JSON file on this device." The app never says "I", never personifies itself, and never claims credit ("Great work!", "You're on a 6-day streak" — neither exists here; there are no streaks, counts, or scores).
- **No exclamation marks, no emoji, no ✅.** Confirmation is the word "Saved" in 13px grey, which fades. Nothing celebrates.
- **Verbs for actions, nouns for places.** Buttons: "Save", "Download my data", "Show all". Screens: "Timeline", "Calendar", "Settings".
- **Empty states state the fact and stop.** "No entries yet." Not "Oops — nothing here yet!" and no illustration.
- **Dates are written out, times are 24-hour.** "3 September 2026", "08:14". Never "3 hrs ago" or "Today at 8:14 AM".
- **One word of prompt on the home screen.** The placeholder "Today..." is the only prompt in the product. No prompts library, no daily themes.
- **Settings prose is descriptive, one or two sentences.** "Plain Journal keeps a plain text record of your days. Entries stay on this device, stay editable, and are never counted, scored, or shared. There is no account to make."

## Visual foundations

**Colour.** Monochrome. Four inks (`--ink-1` #0A0A0A through `--ink-4` #B8B8B8) on white paper, plus one 2% sunk tint (#FAFAFA) used exclusively as a row press state, and two hairline greys (#EDEDED dividers, #DCDCDC input underlines). Three signal hues exist — focus blue, danger red, confirm green — and are reserved for state; nothing in the four screens currently uses them decoratively. There is no brand accent, no dark mode in scope, and no second background colour.

**Type.** Two families, strictly divided. **Playfair Display 500** — a high-contrast display serif — is used for exactly one thing: the "Plain Journal" wordmark at the top of the Entry screen (26/32, `--font-serif-display`, `--text-wordmark-*`). Everything else is **Instrument Sans**, three weights (400/500/600). The serif never appears in body text, buttons, labels, dates, or entry text. Journal body text is the biggest text in the product at 18/30 — larger than any heading it sits under, because the writing outranks the chrome. Display 32/36 semibold, app-bar titles 22/28 semibold, UI body 16/24, labels 15/20 medium, captions 13/18, overline 12 with 0.08em tracking. Negative tracking (-0.01 to -0.02em) on anything 22px and up; never on body or entry text. No italics, no serif, no display face.

**Spacing.** 4px base scale (4·8·12·16·20·24·32·40·48·64). Screen gutter is 20px, app bar 56px, minimum tap target 48px. Whitespace does the work borders would do: settings groups are separated by 32px, not boxes.

**Backgrounds.** Plain `#FFFFFF`, always. No images, no full-bleed photography, no illustration, no pattern, no texture, no grain, no gradient — anywhere, including empty states and the About section. If a design needs a background, the answer is more white space.

**Borders, cards, elevation.** There are no cards in the visual sense. A "card" in the Timeline is a padded row with a 1px `#EDEDED` divider, inset 20px to align with the text. Radii: 0 for lists and rows; 10px for the writing surface and the menu sheet, 6px available for smaller sheets; pill for buttons and the toggle. Exactly one shadow exists in the system, `--shadow-sheet` (0 8px 32px rgba(10,10,10,.10)), used only by the menu popover. No inner shadows. No ring/glow effects.

**Transparency & blur.** Blur is never used. The only transparency is the menu scrim, `rgba(10,10,10,.32)`. No protection gradients (there is no imagery to protect text from), no frosted capsules.

**Animation.** Minimal and short: 120ms for state changes, 180ms for the menu, 260ms reserved for screen transitions, all on one curve — `cubic-bezier(.2,0,0,1)`. The menu fades in and rises 6px. Nothing bounces, springs, scales, or staggers. Saving fades the word "Saved" in and out. No loading spinners (there is no network).

**Hover & press.** Android-first, so hover is not a design state; where a pointer exists, hover is opacity 0.6. Press is opacity 0.55 on buttons and icons, and `--paper-sunk` fill on tappable rows. Press never changes colour, never scales (`--press-scale: 1`), and never ripples.

**Focus.** Fields show focus by moving their underline from #DCDCDC to full ink; the writing surface has no focus treatment at all because it is focused by default and already outlined. `--focus-ring` (#1B4FD8) is available for keyboard focus where a platform needs it.

**Layout rules.** One column, max 520px content width, centred on wide viewports. The app bar is the only fixed element; the Save button sits at the bottom of the Entry screen in flow, not floating. No FAB, no bottom nav, no persistent tab bar, no sticky headers inside lists.

## Iconography

Lucide, 24px, 2px stroke, no fill, solid `--ink-1` (or `--ink-2` when inside a row, where the label leads). Icons are loaded from `https://unpkg.com/lucide-static@0.544.0/icons/<name>.svg` and CSS-rendered as flat `<img>` elements by the `Icon` component — glyphs are always black ink, and the two lighter treatments (`--text-secondary`, `--text-tertiary`) are expressed as opacity rather than recolouring; no icon font, no sprite sheet, no local SVG files, and nothing hand-drawn. The complete inventory used by the app is five glyphs: `menu`, `list`, `calendar`, `settings`, `chevron-left`/`chevron-right`, plus `arrow-left` for back. Emoji are never used, in UI or in copy. Unicode characters are not used as icons. If Lucide is replaced by a supplied set, change the CDN constant in `components/core/Icon.jsx` only.

## Components

Authored from scratch — no source defined an inventory, so this is the smallest set the four screens need. **Intentional additions:** `Icon` (a wrapper so a CDN glyph set can be swapped in one place) and `EntryField` (the writing surface deserves its own contract, distinct from a generic textarea).

**Core** — `components/core/`
- `Button` — pill; primary (black), secondary (hairline), ghost. One primary per screen.
- `IconButton` — 48×48 transparent tap target around one glyph; app bar only.
- `Icon` — masked Lucide glyph in any token colour.
- `TextInput` — single line, hairline underline, no box.
- `EntryField` — the auto-focused writing surface: hairline outline, 10px radius, 16px padding.
- `Switch` — 44×26 track, ink when on.
- `Divider` — 1px hairline, optional inset.
- `SectionLabel` — 12px uppercase tertiary grey group label.

**App surfaces** — `components/app/`
- `AppBar` — 56px, no fill, no shadow, optional title and up to two actions.
- `MenuSheet` — the entire navigation model: popover under the hamburger, over a scrim.
- `EntryCard` — timeline row: date, time, two clamped lines.
- `CalendarMonth` — month grid with entry dots and a filled selected day.
- `SettingRow` — label, optional description, optional trailing control.
- `TimeField` — bare native time input for the reminder.

Each directory holds `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and one card HTML.

## Index

- `styles.css` — the one stylesheet consumers link; `@import`s only.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `shape.css`, `motion.css`.
- `components/core/`, `components/app/` — the 14 components above.
- `guidelines/` — 18 foundation specimen cards (Colors, Type, Spacing, Shape, Brand).
- `ui_kits/plain-journal-app/` — the interactive four-screen Android recreation; see its `README.md`.
- `thumbnail.html` — homepage tile.
- `SKILL.md` — Agent Skills entry point.
- `assets/` — empty by design: no logo, icon, or image assets were supplied.

## Rules of thumb

1. If an element can be removed and the screen still works, remove it.
2. Separation is space first, a hairline second, never a shadow.
3. The user's own words are the largest thing on any screen they appear on.
4. Never add a count, streak, score, mood tag, or reward.
5. Navigation stays behind the hamburger. Adding a tab bar breaks the product.
