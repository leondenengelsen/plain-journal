import { useState, useEffect } from 'react'
import { loadEntries, sortEntriesNewestFirst } from './storage.js'
import EntryCard from './EntryCard.jsx'
import HamburgerMenu from './HamburgerMenu.jsx'

function Timeline() {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    setEntries(sortEntriesNewestFirst(loadEntries()))
  }, [])

  function handleDeleted(id) {
    setEntries((current) => current.filter((entry) => entry.id !== id))
  }

  return (
    <div className="timeline-screen">
      <HamburgerMenu />

      <div className="timeline">
        {entries.length === 0 && <p className="timeline-empty">No entries yet.</p>}

        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onDeleted={handleDeleted} />
        ))}
      </div>
    </div>
  )
}

export default Timeline
