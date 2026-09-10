import { useState, useEffect } from 'react'
import {
  loadSettings,
  saveSettings,
  mergeImportedEntries,
  clearAllEntries,
} from './storage.js'
import { exportEntries, pickEntriesFileText } from './export.js'
import { scheduleDailyReminder, cancelDailyReminder } from './reminder.js'
import { loadFont, saveFont, applyFont } from './font.js'
import { hasPin } from './lock.js'
import HamburgerMenu from './HamburgerMenu.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import BottomSheet from './BottomSheet.jsx'
import PinSetup from './PinSetup.jsx'

function Settings() {
  // null until loaded from storage (Preferences reads are async now).
  const [settings, setSettings] = useState(null)
  const [font, setFont] = useState(loadFont)
  // Feedback for the Your-data section — set by either Export or Import
  // (only one runs at a time). Shape: { ok: boolean, message: string }.
  const [dataResult, setDataResult] = useState(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const [pinOn, setPinOn] = useState(hasPin)
  const [setupOpen, setSetupOpen] = useState(false)
  // Set when the user enables the reminder but hasn't granted notification
  // permission — the toggle can't actually do anything until they do.
  const [reminderDenied, setReminderDenied] = useState(false)

  useEffect(() => {
    async function load() {
      setSettings(await loadSettings())
    }
    load()
  }, [])

  // Settings apply immediately (no Save button): update state, persist, and
  // tell the reminder scheduler. `apply` centralises those three steps.
  async function apply(next) {
    setSettings(next)
    await saveSettings(next)

    if (!next.reminderEnabled) {
      await cancelDailyReminder()
      setReminderDenied(false)
      return
    }

    const result = await scheduleDailyReminder(next.reminderTime)
    if (result.ok) {
      setReminderDenied(false)
    } else {
      // Permission was declined — undo the toggle so it doesn't look active,
      // and show the explanation.
      setReminderDenied(true)
      const reverted = { ...next, reminderEnabled: false }
      setSettings(reverted)
      await saveSettings(reverted)
    }
  }

  function toggleReminder(e) {
    apply({ ...settings, reminderEnabled: e.target.checked })
  }

  function changeTime(e) {
    apply({ ...settings, reminderTime: e.target.value })
  }

  function toggleFont() {
    const next = font === 'serif' ? 'sans' : 'serif'
    setFont(next)
    applyFont(next)
    saveFont(next)
  }

  async function handleExport() {
    const result = await exportEntries()
    if (result.cancelled) {
      return // user backed out of the share sheet — say nothing
    }
    if (result.ok) {
      setDataResult({ ok: true, message: 'Export ready — choose where to save it.' })
    } else {
      setDataResult({ ok: false, message: result.message })
    }
  }

  async function handleImport() {
    const picked = await pickEntriesFileText()
    if (picked.cancelled) {
      return // user closed the picker — say nothing
    }
    if (!picked.ok) {
      setDataResult({ ok: false, message: picked.message })
      return
    }

    try {
      const { imported, skipped } = await mergeImportedEntries(picked.text)
      setDataResult({
        ok: true,
        message:
          `Imported ${imported} ${imported === 1 ? 'entry' : 'entries'}` +
          (skipped > 0 ? `, skipped ${skipped} (already here or invalid).` : '.'),
      })
    } catch (err) {
      setDataResult({ ok: false, message: err.message })
    }
  }

  async function handleResetConfirm() {
    await clearAllEntries()
    setResetOpen(false)
    setResetDone(true)
  }

  // The checkbox just opens the setup flow; the PIN isn't actually set or
  // removed until PinSetup finishes and calls onDone with the real result.
  function handlePinDone(pinNowSet) {
    setPinOn(pinNowSet)
    setSetupOpen(false)
  }

  // Wait for settings to load before rendering — the JSX below reads
  // settings.reminderEnabled / .reminderTime, which would throw on null.
  if (settings === null) {
    return (
      <div className="settings-screen">
        <header className="app-header">
          <h1 className="settings-title app-header-title">Settings</h1>
          <HamburgerMenu />
        </header>
      </div>
    )
  }

  return (
    <div className="settings-screen">
      <header className="app-header">
        <h1 className="settings-title app-header-title">Settings</h1>
        <HamburgerMenu />
      </header>

      <section className="settings-section">
        <h2>Daily reminder</h2>

        <label className="settings-row">
          <span>Remind me to write</span>
          <input type="checkbox" checked={settings.reminderEnabled} onChange={toggleReminder} />
        </label>

        {settings.reminderEnabled && (
          <label className="settings-row">
            <span>Time</span>
            <input type="time" value={settings.reminderTime} onChange={changeTime} />
          </label>
        )}

        {reminderDenied && (
          <p className="settings-error">
            Notifications are turned off for Your Journal. Enable them in your device&rsquo;s
            app settings, then switch this back on.
          </p>
        )}
      </section>

      <section className="settings-section">
        <h2>Appearance</h2>
        <div className="settings-row">
          <span>Dark mode</span>
          <ThemeToggle />
        </div>
        <div className="settings-row">
          <span>Font</span>
          <button type="button" className="settings-button" onClick={toggleFont}>
            {font === 'serif' ? 'Serif' : 'Sans'}
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Privacy</h2>
        <label className="settings-row">
          <span>Require a PIN</span>
          <input type="checkbox" checked={pinOn} onChange={() => setSetupOpen(true)} />
        </label>

        <p className="settings-hint">
          A 4-digit PIN to open the app. This is a casual lock, not encryption &mdash; your
          entries are still readable to anyone with technical access to this device. There is
          no PIN recovery: if you forget it, the only way back in is clearing the app&rsquo;s
          data, which also deletes your entries.
        </p>
      </section>

      <BottomSheet open={setupOpen} onClose={() => setSetupOpen(false)}>
        <PinSetup onDone={handlePinDone} onCancel={() => setSetupOpen(false)} />
      </BottomSheet>

      <section className="settings-section">
        <h2>Your data</h2>
        <p className="settings-hint">
          Save every entry as a JSON file, or load entries back from one.
        </p>
        <div className="settings-button-row">
          <button type="button" className="settings-button" onClick={handleExport}>
            Export
          </button>
          <button type="button" className="settings-button" onClick={handleImport}>
            Import
          </button>
        </div>
        {dataResult && (
          <p className={dataResult.ok ? 'settings-hint' : 'settings-error'}>
            {dataResult.message}
          </p>
        )}
      </section>

      <section className="settings-section">
        <h2>About</h2>
        <p className="settings-about">
          By writing a couple of words every night, we reflect and learn.
        </p>
        <p className="settings-about">
          Your Journal is a totally free, privacy-first, no-strings-attached
          journalling app by Leon den Engelsen.
        </p>
        <p className="settings-about-meta">
          Version 1.0.0 &middot; all data is stored on this device only.
        </p>
      </section>

      <section className="settings-section">
        <h2>Danger zone</h2>
        <p className="settings-hint">
          Delete every entry and start over. This can&rsquo;t be undone &mdash; export first if
          you want a copy.
        </p>
        <button
          type="button"
          className="settings-button settings-button-danger"
          onClick={() => setResetOpen(true)}
        >
          Reset journal
        </button>
        {resetDone && <p className="settings-hint">Journal reset &mdash; all entries deleted.</p>}
      </section>

      <ConfirmDialog
        open={resetOpen}
        message="Delete ALL entries? This can’t be undone."
        confirmLabel="Delete everything"
        onConfirm={handleResetConfirm}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  )
}

export default Settings
