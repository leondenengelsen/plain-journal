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
      <HamburgerMenu />

      <header className="masthead">
        <h1 className="wordmark">Your Journal</h1>
        <p className={isEditingExisting ? 'today today-editing' : 'today'}>{displayDate}</p>
      </header>

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
