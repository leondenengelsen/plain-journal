export function datesWithEntries(entries) {
  return new Set(entries.map((entry) => entry.ts.slice(0, 10)))
}

export function buildMonthGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []

  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day)
  }

  return cells
}
