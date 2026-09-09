# ship.md — getting Plain Journal into the stores

Step-by-step shipping guide, separate from [plan.md](plan.md) (the spec/phases),
[todo.md](todo.md) (progress tracker) and [CLAUDE.md](CLAUDE.md) (process rules).
This file is the "Phase 7" detail. Follow it top to bottom when you're ready to ship.

**Written 2026-09-09.** Store rules change — re-check the linked official pages before
you actually submit. Dates/fees below are current as of writing.

---

## The honest cost picture ("totally free")

Two different meanings of "free", both of which you asked about:

### Free *for users*
Plain Journal is free to download, has **no ads, no in-app purchases, no subscriptions,
no analytics, no tracking, no accounts**. All data stays on the device. This is already
true of the code and is what the About text says. In the store listings you just
*declare* it (pricing = Free, no ads, data-safety / privacy forms say "no data
collected"). No cost, no catch — the stores don't charge to list a free app.

### Cost *to you, the publisher*
| Item | Google Play | Apple App Store |
|---|---|---|
| Developer account | **$25 one-time** | **$99 / year** (recurring) |
| Keystore / signing cert | free (you generate it) | free (Xcode/Apple manage it) |
| Hosting a privacy policy | free (a GitHub Pages / Netlify page) | same |
| Anything else required | nothing | nothing |

So: **Google Play = $25 once, then genuinely free forever.**
**Apple = $99 every year** — there is no way to publish to the App Store without the
paid Apple Developer Program. A *free* Apple account only lets you build and run the app
on your own devices, not publish it. (Sources at the bottom.)

**Recommendation:** ship to Google Play now. Treat iOS as a separate future phase
(section near the bottom) — it's blocked until you decide the $99/yr is worth it.

---

## Part 0 — Wrap the web app with Capacitor (do this first)

Everything else depends on this. This is where plan.md's Phase 1 "add Capacitor" work
actually happens — it was deliberately deferred until the web app was done
([[build-decisions]] in memory: web-first, wrap afterward).

All commands run inside `plain-journal/`.

1. **Install the Capacitor core + CLI + Android platform packages**
   ```
   npm install @capacitor/core
   npm install -D @capacitor/cli
   npm install @capacitor/android
   ```
2. **Initialise Capacitor** — creates `capacitor.config.json` (this project is plain JS,
   so JSON, not the `.ts` form you'll see in Capacitor's docs)
   ```
   npx cap init "Plain Journal" com.plainjournal.app --web-dir=dist
   ```
   - `"Plain Journal"` = the app's display name (can change later; brand name is still
     technically open per plan.md, but `com.plainjournal.app` is locked).
   - `com.plainjournal.app` = the **application ID** — this is permanent once published.
     It cannot be changed for an existing Play/App Store listing ever.
   - `--web-dir=dist` = Vite builds to `dist/`; that's the folder Capacitor copies into
     the native shell.
3. **Build the web app, then add the native Android project**
   ```
   npm run build
   npx cap add android
   ```
   This generates an `android/` folder — a real Gradle Android Studio project. It's
   checked into git (you'll edit files in it: icons, `strings.xml`, signing config).
4. **The sync cycle you'll repeat forever after**
   ```
   npm run build && npx cap sync android
   ```
   `sync` = copy the fresh `dist/` into the native project + update native plugin config.
   Run it after every web change you want to see on-device.
5. **Open in Android Studio and run on the emulator**
   ```
   npx cap open android
   ```
   Press Run. You should see the exact app you see in the browser, in an Android window.
6. **Swap the storage layer to the Capacitor Preferences plugin** *(optional but planned)*
   - `npm install @capacitor/preferences`
   - `storage.js` currently uses raw `localStorage`. `localStorage` **does work** inside
     the Capacitor WebView, so this isn't strictly required to ship — but the plan
     (plan.md, [[build-decisions]]) always intended to move to the Preferences plugin so
     the data lives in real native storage, not WebView storage that an OS "clear cache"
     could wipe. Only the internals of `storage.js` change; every call site stays the same.
7. **Make the daily reminder + export real** *(the two remaining stubs)*
   - `npm install @capacitor/local-notifications` — replace the body of
     `scheduleDailyReminder` / `cancelDailyReminder` in `reminder.js` (the recipe is
     already written in that file's comment block). A browser can't fire a notification
     while the app is closed; the OS can.
   - `npm install @capacitor/filesystem @capacitor/share` — replace the body of
     `downloadEntriesJSON` in `export.js` with `Filesystem.writeFile` + `Share.share`
     (native share sheet) instead of the throwaway `<a download>`. Call site in
     `Settings.jsx` doesn't change.
8. **Verify on-device:** write an entry, kill the app, reopen — entry still there.
   Toggle the reminder, wait for it to fire. Export — the native share sheet appears.
   Toggle dark mode / serif. Set a PIN, reopen, confirm the lock screen gates entry.

**Teaching-contract note:** per CLAUDE.md this is many files — do it one at a time with
explanations. `capacitor.config.ts` in particular is exactly the kind of "invisible"
file the contract says to explain, not skip.

---

## Part 1 — Google Play (the active track)

### 1a. One-time account setup
1. **Create a Google Play Developer account** — https://play.google.com/console/signup
   - Sign in with a Google account (use a dedicated one you won't lose).
   - Pay the **$25 one-time** registration fee.
   - **Identity verification is now mandatory** — you upload a government photo ID.
     Usually clears in 1–2 days. Do this early; it can block you later otherwise.
   - Choose account type **Personal** (an Organisation account needs a D-U-N-S number —
     overkill for this). Note the consequence in 1c below.

### 1b. Prepare the release build (in `plain-journal/`)
1. **Set the app's version** in `android/app/build.gradle`:
   - `versionCode` — an integer, must increase with every upload (start at `1`).
   - `versionName` — the human string users see (`"1.0.0"`).
2. **Set the target SDK.** Google Play requires **new apps to target Android 16
   (API level 36) or higher from 31 August 2026** (extension possible to 1 Nov 2026).
   In `android/app/build.gradle` set `targetSdkVersion 36` (and `compileSdkVersion 36`).
   Recent Capacitor versions default to a compliant level — check and bump if needed.
3. **App icons + splash.** Replace the placeholder launcher icons:
   - Easiest: `npm install -D @capacitor/assets`, drop a 1024×1024 `icon.png` (and
     optional `splash.png`) in an `assets/` folder, run `npx capacitor-assets generate`.
   - Or use Android Studio's Image Asset wizard.
   - The favicon (`public/favicon.svg`, the Heroicons pencil) is a good visual starting
     point for the launcher icon.
4. **App display name** — `android/app/src/main/res/values/strings.xml`, the `app_name`
   string. This is what shows under the icon on the home screen.
5. **Generate an upload keystore** (this signs your app; losing it means you can never
   update the app again — back it up in a password manager + one offline copy):
   ```
   keytool -genkey -v -keystore plain-journal-upload.keystore \
     -alias plain-journal -keyalg RSA -keysize 2048 -validity 10000
   ```
   Store the keystore file **outside** the repo (or in the repo but git-ignored) and put
   the passwords in `android/keystore.properties` (also git-ignored). Wire that file into
   `android/app/build.gradle`'s `signingConfigs`.
6. **Build a signed Android App Bundle** (`.aab` — Play requires AAB, not APK, for new
   apps):
   ```
   npm run build && npx cap sync android
   cd android && ./gradlew bundleRelease
   ```
   Output: `android/app/build/outputs/bundle/release/app-release.aab`.
   Enable **Play App Signing** when prompted in the Console (Google holds the final
   signing key; your keystore is just the "upload" key — if you lose the upload key you
   can reset it, which is why AAB + Play App Signing is the safer path).

### 1c. Closed testing requirement (personal accounts only)
If your developer account is **personal** and was created after 13 Nov 2023, Google
requires, **before** you can push to production:
- A **closed test** with **at least 12 testers** opted in,
- Kept opted in **continuously for at least 14 days**,
- And the testers must actually open/use the app (Google checks engagement).

Practically: create a closed-testing track, make an email list or a Google Group of 12+
people (friends, family, other devs), send them the opt-in link, ask them to install and
open it, wait out the 14 days, then apply for production access. Plan for this — it adds
**2+ weeks** to your timeline that you can't compress.

### 1d. The store listing (in Play Console)
Create the app, then fill in:
- **App name:** "Plain Journal" (or the final brand name if you've picked one).
- **Short description** (80 chars) + **full description** (4000 chars).
- **App icon:** 512×512 PNG.
- **Feature graphic:** 1024×500 PNG.
- **Screenshots:** at least 2 phone screenshots (take them from the emulator — entry
  screen, timeline, calendar, settings). PNG/JPG, specific size rules in the Console.
- **Category:** Lifestyle or Productivity. **Content rating:** fill the questionnaire
  (this app → "Everyone").
- **Privacy policy URL** — **required even though you collect nothing.** Write a short
  plain-language policy ("Plain Journal stores all your entries only on your device. It
  has no servers, collects no data, and shares nothing with anyone.") and host it as a
  free static page (GitHub Pages, Netlify, a Gist). Paste the URL.
- **Data safety form** — declare "No data collected" / "No data shared". Be accurate:
  entries stay on device, nothing leaves except when *the user themselves* taps Export.
- **Ads declaration:** "No, my app does not contain ads."
- **Pricing:** Free. (Once an app is published Free it can never be switched to Paid.)
- **Target audience & content:** not directed at children (keeps you out of the stricter
  Families policy).

### 1e. Submit
- Upload the `.aab` to the **Production** track (after closed testing clears, 1c).
- Complete every section the Console marks incomplete (it has a checklist dashboard).
- Submit for review. First review typically takes a few days to ~a week.
- On approval it goes live. Updates = bump `versionCode`, rebuild the bundle, upload,
  submit — much faster review after the first.

---

## Part 2 — Apple App Store (FUTURE — blocked until you pay the $99/yr)

**Status: not the active track.** You have a Mac (so the *tooling* is available) but
publishing to the App Store is impossible without the paid **Apple Developer Program
($99/year, recurring)**. Documented here so you understand the shape of it; revisit if
you decide the yearly fee is worth it.

### Prerequisites (all required, no workarounds)
- A **Mac** with a recent **macOS** and **Xcode** installed (free from the Mac App Store).
- **CocoaPods** (`sudo gem install cocoapods` or via Homebrew).
- **Apple Developer Program membership — $99/year.** A free Apple ID is not enough to
  publish; it only allows building to your own devices.

### 2a. Add the iOS platform (in `plain-journal/`)
```
npm install @capacitor/ios
npm run build
npx cap add ios
npx cap open ios   # opens Xcode
```
Generates an `ios/` folder (a real Xcode project, checked into git).

### 2b. Make the two stubs work on iOS too
The same plugins from Part 0 step 7 (`@capacitor/local-notifications`,
`@capacitor/filesystem`, `@capacitor/share`, `@capacitor/preferences`) are
cross-platform — `npx cap sync ios` wires them into the Xcode project. iOS additionally
needs **usage-description strings** in `Info.plist` for notifications (Xcode will prompt).

### 2c. Xcode / signing setup
- In Xcode, set the **Bundle Identifier** to `com.plainjournal.app` (match Android).
- Set **Display Name**, **version**, **build number**.
- Sign in with your Apple Developer account under Signing & Capabilities; let Xcode
  manage signing (it creates the certificates/provisioning profiles).
- Add the **app icon set** (1024×1024 master; Xcode's asset catalog generates the rest —
  or `@capacitor/assets` does iOS icons too).

### 2d. App Store Connect
1. Create the app record at https://appstoreconnect.apple.com — pick the bundle ID,
   set the name, primary language, SKU.
2. **Pricing:** Free.
3. **App Privacy ("privacy nutrition label")** — fill the questionnaire. For this app:
   "Data Not Collected" across the board. Apple *requires* this to submit.
4. **Privacy policy URL** — required (reuse the same hosted page from Play).
5. **Screenshots** — required at specific pixel sizes for at least one iPhone display
   class (6.7" and/or 6.5"). Take them from the iOS Simulator.
6. **Description, keywords, support URL, category** (Lifestyle / Productivity).
7. **Age rating** questionnaire → 4+.
8. **Export compliance** — you'll be asked if the app uses encryption. It uses the PIN
   hash (SHA-256 via the OS/Web Crypto) but only standard, exempt cryptography — answer
   accordingly (typically "uses exempt encryption").

### 2e. Build & submit
- In Xcode: **Product → Archive**, then **Distribute App → App Store Connect → Upload**.
- Back in App Store Connect, attach the uploaded build to the version, complete every
  required field, **Submit for Review**.
- Apple review is stricter and more hands-on than Google's — expect 1–3 days, and be
  ready for a rejection asking for clarification (common, not a disaster). A single
  static, offline, no-account journal app is low-risk though.
- On approval, either it releases automatically or you press "Release" (your choice at
  submit time).

### 2f. The recurring obligation
- **$99 every year** or the app is *removed* from the App Store.
- Apple periodically requires apps to be rebuilt against newer Xcode/SDK versions to stay
  in the store — roughly once a year you'll need to open the project, update, re-archive,
  resubmit, even if nothing else changed.

---

## Suggested order of work

1. **Part 0** — Capacitor wrap + make the 2 stubs real + move storage to Preferences.
   Get it running on the Android emulator, then a real Android phone.
2. **Part 1a** — create the Play account + start ID verification *now* (it's slow).
3. **Part 1b–1c** — release build + start the 12-tester / 14-day closed test *early*
   (the clock is the long pole).
4. **Part 1d** — write the privacy policy page + prepare listing assets while the test
   runs.
5. **Part 1e** — submit to production once closed testing clears.
6. **Part 2** — only after Android is live and only if you commit to the $99/yr.

---

## Sources (re-check before submitting — rules change)

- Google Play — target API level requirement: https://support.google.com/googleplay/android-developer/answer/11926878
- Google Play — closed testing requirement for new personal accounts (12 testers / 14 days): https://support.google.com/googleplay/android-developer/answer/14151465
- Google Play — Console signup / $25 fee / identity verification: https://play.google.com/console/signup
- Google Play — data safety form: https://support.google.com/googleplay/android-developer/answer/10787469
- Capacitor — Android platform docs: https://capacitorjs.com/docs/android
- Capacitor — iOS platform docs: https://capacitorjs.com/docs/ios
- Apple Developer Program ($99/year, needed to publish): https://developer.apple.com/programs/
- Apple — App privacy details ("nutrition label"): https://developer.apple.com/app-store/app-privacy-details/
