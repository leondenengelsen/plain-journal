import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadEntries, saveEntries, formatLocalTimestamp } from './storage.js'
import HamburgerMenu from './HamburgerMenu.jsx'

function EntryScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')
  const [entryDate, setEntryDate] = useState(null)
  const canSave = draft.trim().length > 0
  const fieldRef = useRef(null)
  const isEditingExisting = id != null && entryDate != null
  const displayDate = (isEditingExisting ? entryDate : new Date()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  useEffect(() => {
    if (id) {
      const existing = loadEntries().find((entry) => entry.id === id)
      if (existing) {
        setDraft(existing.text)
        setEntryDate(new Date(existing.ts))
      }
    }
  }, [id])

  useEffect(() => {
    fieldRef.current.focus()
  }, [])

  function handleSave() {
    const entries = loadEntries()

    if (id) {
      const updated = entries.map((entry) =>
        entry.id === id ? { ...entry, text: draft } : entry,
      )
      saveEntries(updated)
    } else {
      const entry = {
        id: crypto.randomUUID(),
        ts: formatLocalTimestamp(),
        text: draft,
      }
      saveEntries([...entries, entry])
    }

    setDraft('')
    navigate('/')
  }

  return (
    <div className="entry-screen">
      <header className="app-header">
        <h1 className="wordmark app-header-title">Your Journal</h1>
        <HamburgerMenu />
      </header>

      <p className={isEditingExisting ? 'today today-editing' : 'today'}>{displayDate}</p>

      <div className="writing-surface">
        <textarea
          ref={fieldRef}
          className="entry-field"
          placeholder="Today..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </div>

      <footer className="footer">
        <button type="button" className="save-button" disabled={!canSave} onClick={handleSave}>
          Save
        </button>
      </footer>
    </div>
  )
}

export default EntryScreen
