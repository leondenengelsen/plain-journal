import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { loadEntries } from './storage.js'
import { buildMonthGrid, datesWithEntries } from './calendar.js'
import HamburgerMenu from './HamburgerMenu.jsx'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABEL = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })

function pad(n) {
  return String(n).padStart(2, '0')
}

function Calendar() {
  const navigate = useNavigate()
  const [monthStart, setMonthStart] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [markedDates, setMarkedDates] = useState(new Set())

  useEffect(() => {
    setMarkedDates(datesWithEntries(loadEntries()))
  }, [])

  const year = monthStart.getFullYear()
  const month = monthStart.getMonth()
  const cells = buildMonthGrid(year, month)

  function goToPrevMonth() {
    setMonthStart(new Date(year, month - 1, 1))
  }

  function goToNextMonth() {
    setMonthStart(new Date(year, month + 1, 1))
  }

  function handleDayClick(day) {
    const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`
    navigate(`/timeline?date=${dateKey}`)
  }

  return (
    <div className="calendar-screen">
      <header className="calendar-header">
        <HamburgerMenu />
      </header>

      <div className="calendar-nav">
        <button type="button" onClick={goToPrevMonth} aria-label="Previous month">
          <ChevronLeftIcon className="calendar-nav-icon" />
        </button>
        <p className="calendar-month-label">{MONTH_LABEL.format(monthStart)}</p>
        <button type="button" onClick={goToNextMonth} aria-label="Next month">
          <ChevronRightIcon className="calendar-nav-icon" />
        </button>
      </div>

      <div className="calendar-grid">
        {WEEKDAY_LABELS.map((label) => (
          <p key={label} className="calendar-weekday">
            {label}
          </p>
        ))}

        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`blank-${index}`} className="calendar-day calendar-day-blank" />
          }

          const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`
          const hasEntry = markedDates.has(dateKey)

          return (
            <button
              key={dateKey}
              type="button"
              className="calendar-day"
              onClick={() => handleDayClick(day)}
            >
              <span>{day}</span>
              {hasEntry && <span className="calendar-day-dot" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
