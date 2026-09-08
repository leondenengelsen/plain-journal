import { useState, useRef } from 'react'
import {
  loadSettings,
  saveSettings,
  mergeImportedEntries,
  clearAllEntries,
} from './storage.js'
import { downloadEntriesJSON } from './export.js'
import { scheduleDailyReminder, cancelDailyReminder } from './reminder.js'
import { loadTheme, saveTheme, applyTheme } from './theme.js'
import HamburgerMenu from './HamburgerMenu.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'

// Read a File the user picked as text. FileReader is event-based; wrap it in a
// Promise so the caller can await it.
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

function Settings() {
  const [settings, setSettings] = useState(loadSettings)
  const [theme, setTheme] = useState(loadTheme)
  const [importResult, setImportResult] = useState(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const fileInputRef = useRef(null)

  // Settings apply immediately (no Save button): update state, persist, and
  // tell the reminder scheduler. `apply` centralises those three steps.
  function apply(next) {
    setSettings(next)
    saveSettings(next)
    if (next.reminderEnabled) {
      scheduleDailyReminder(next.reminderTime)
    } else {
      cancelDailyReminder()
    }
  }

  function toggleReminder(e) {
    apply({ ...settings, reminderEnabled: e.target.checked })
  }

  function changeTime(e) {
    apply({ ...settings, reminderTime: e.target.value })
  }

  function toggleTheme(e) {
    const next = e.target.checked ? 'dark' : 'light'
    setTheme(next)
    applyTheme(next) // repaint now
    saveTheme(next) // remember for next launch
  }

  async function handleImportFile(e) {
    const file = e.target.files[0]
    e.target.value = '' // let the same file be picked again on a retry
    if (!file) {
      return
    }

    try {
      const text = await readFileAsText(file)
      const { imported, skipped } = mergeImportedEntries(text)
      setImportResult({
        ok: true,
        message:
          `Imported ${imported} ${imported === 1 ? 'entry' : 'entries'}` +
          (skipped > 0 ? `, skipped ${skipped} (already here or invalid).` : '.'),
      })
    } catch (err) {
      setImportResult({ ok: false, message: err.message })
    }
  }

  function handleResetConfirm() {
    clearAllEntries()
    setResetOpen(false)
    setResetDone(true)
  }

  return (
    <div className="settings-screen">
      <HamburgerMenu />

      <h1 className="settings-title">Settings</h1>

      <section className="settings-section">
        <h2>Your data</h2>
        <p className="settings-hint">
          Download every entry as a JSON file, or load entries back from one.
        </p>
        <div className="settings-button-row">
          <button type="button" className="settings-button" onClick={downloadEntriesJSON}>
            Export
          </button>
          <button
            type="button"
            className="settings-button"
            onClick={() => fileInputRef.current.click()}
          >
            Import
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={handleImportFile}
        />
        {importResult && (
          <p className={importResult.ok ? 'settings-hint' : 'settings-error'}>
            {importResult.message}
          </p>
        )}
      </section>

      <section className="settings-section">
        <h2>Appearance</h2>
        <label className="settings-row">
          <span>Dark mode</span>
          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
        </label>
      </section>

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

        <p className="settings-hint">
          Reminders aren&rsquo;t active yet &mdash; they&rsquo;ll work once the app runs on your phone.
        </p>
      </section>

      <section className="settings-section">
        <h2>About</h2>
        <p className="settings-about">
          Plain Journal, a totally free, privacy-first, no-strings-attached private
          journal app by Leon den Engelsen.
        </p>
        <p className="settings-about-meta">
          Version 0.0.0 &middot; all data is stored on this device only.
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
