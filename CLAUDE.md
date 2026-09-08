# CLAUDE.md — Plain Journal

This file tells Claude Code how to work on this project. The full product spec, data model, and phase-by-phase build plan live in [plan.md](plan.md) — read that first for *what* to build. This file governs *how* to build it.

## What this project is

A minimal Android diary app (React + Capacitor). It doubles as a portfolio piece and a learning project. **The user's primary goal is to understand every part of the code they end up with — not to receive a finished app.** Optimizing for "done fast" instead of "understood" is the single biggest way to fail this project, even if the resulting code is correct.

## Working name (decided)

- Project / npm package name: `plain-journal`
- Android application ID: `com.plainjournal.app`

These are locked so Phase 1 scaffolding has concrete values to use. The *public-facing brand name* shown to users in the app itself is still open (see plan.md's "Naming" section — Daily, Dear, Nook, etc. are still on the table) and should be revisited before Phase 7 / Play Store listing. Don't confuse the two: renaming the brand later should not require renaming the package/app ID.

## The teaching contract (read this before writing any code)

This is the most important section in this file. The user has explicitly said they need to follow every single step to understand how the code works. Concretely, that means:

1. **One phase at a time, in plan.md's order.** Don't jump ahead to a later phase because it seems easy or related — finish and confirm the current phase first.
2. **Explain, then write one file, then stop.** Before creating or editing any single file:
   - Explain the concept in plain language first: what this file/piece does, why it's needed, how it fits into the app as a whole.
   - Then show the code.
   - Then **stop and wait for the user's explicit go-ahead** before touching the next file. Do not create or edit multiple files in one turn "to save time" — that defeats the purpose even if it's more efficient.
3. **Walk through non-trivial code after writing it.** Assume the user wants to understand what each meaningful block does, not just approve a diff. This includes boilerplate — a Vite config or `capacitor.config.ts` is exactly the kind of "invisible" file a learner needs explained, not skipped.
4. **No unexplained magic.** If a library or API is doing something non-obvious under the hood (e.g., how Capacitor Preferences persists data, how Capacitor bridges web code to native Android), explain it before or alongside the code that uses it — even if the user didn't ask.
5. **Small, understandable commits over large generated blocks.** If a step would naturally produce a big chunk of generated code, break it into smaller pieces and explain each piece rather than dropping it all at once.
6. **It's fine to be slower.** This project explicitly trades speed for understanding. Don't default to batching work to be efficient — check in more than you think you need to.

If you (Claude) are ever about to write more than one new file, or generate a large block of code, before doing so: pause and check whether that violates rule 2 above.

## Progress log

[todo.md](todo.md) is the running progress tracker — separate from plan.md (fixed spec/phases) and this file (process rules). After completing a step, file, or phase-worthy chunk of work, update `todo.md` with what was done, what's next, and any new decisions, so a future session can pick up from it without re-deriving context. Check `todo.md` at the start of a session to see where things left off.

## Environment status (checked 2026-09-03)

Already installed and confirmed working — don't redo Phase 0 installs blindly, just verify these still work:
- Node v22.14.0, npm 11.6.4
- JDK 21 (Homebrew OpenJDK)
- Android SDK at `~/Library/Android/sdk` (build-tools, cmdline-tools, emulator, platform-tools, platforms, skins, system-images present)

Still to confirm when Phase 0 actually starts: Android Studio itself (GUI app, not just SDK), and that an emulator image is set up and launches.

## Stack reminders

- React + Vite (not Create React App)
- Capacitor for the native Android wrapper
- Capacitor plugins used: Preferences (storage), Local Notifications (daily reminder), Filesystem + Share (JSON export)
- No backend, no accounts, no login in v1 — all data on-device
- Cloud sync (Netlify-hosted, username-based) is explicitly deferred, not part of v1 — don't introduce it early "for future-proofing"

## Source of truth

For screen specs, the data model, the design prompt, and the full phase checklist: see [plan.md](plan.md). Keep this file (CLAUDE.md) focused on process rules; update plan.md itself (not here) when the product spec changes.
