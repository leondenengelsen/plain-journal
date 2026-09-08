import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { loadEntries, sortEntriesNewestFirst } from './storage.js'
import EntryCard from './EntryCard.jsx'
import HamburgerMenu from './HamburgerMenu.jsx'

function Timeline() {
  const [entries, setEntries] = useState([])
  const [searchParams] = useSearchParams()
  const dateFilter = searchParams.get('date')

  useEffect(() => {
    setEntries(sortEntriesNewestFirst(loadEntries()))
  }, [])

  function handleDeleted(id) {
    setEntries((current) => current.filter((entry) => entry.id !== id))
  }

  const visibleEntries = dateFilter
    ? entries.filter((entry) => entry.ts.slice(0, 10) === dateFilter)
    : entries

  return (
    <div className="timeline-screen">
      <header className="app-header">
        <Link to="/calendar" className="calendar-button" aria-label="Calendar">
          <CalendarDaysIcon className="calendar-button-icon" />
        </Link>
        <HamburgerMenu />
      </header>

      {dateFilter && <p className="timeline-filter-label">Showing entries for {dateFilter}</p>}

      <div className="timeline">
        {visibleEntries.length === 0 && (
          <p className="timeline-empty">
            {dateFilter ? 'No entries for this day.' : 'No entries yet.'}
          </p>
        )}

        {visibleEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onDeleted={handleDeleted} />
        ))}
      </div>
    </div>
  )
}

export default Timeline
