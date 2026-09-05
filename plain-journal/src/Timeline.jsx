import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { loadEntries, sortEntriesNewestFirst } from './storage.js'

function snippetFor(text) {
  const firstLine = text.split('\n')[0]
  if (firstLine.length <= 80) {
    return firstLine
  }
  return firstLine.slice(0, 80) + '…'
}

function Timeline() {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    setEntries(sortEntriesNewestFirst(loadEntries()))
  }, [])

  return (
    <div className="timeline">
      {entries.length === 0 && <p className="timeline-empty">No entries yet.</p>}

      {entries.map((entry) => (
        <Link key={entry.id} to={`/entry/${entry.id}`} className="entry-card">
          <p className="entry-card-ts">{entry.ts.replace('T', ' ')}</p>
          <p className="entry-card-snippet">{snippetFor(entry.text)}</p>
        </Link>
      ))}
    </div>
  )
}

export default Timeline
