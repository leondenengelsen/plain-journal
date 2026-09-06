const ENTRIES_KEY = 'plain-journal:entries'

function pad(n) {
  return String(n).padStart(2, '0')
}

export function formatLocalTimestamp(date = new Date()) {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1) // getMonth() is 0-indexed (0 = January)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function loadEntries() {
  const raw = localStorage.getItem(ENTRIES_KEY)
  if (raw === null) {
    return []
  }
  return JSON.parse(raw)
}

export function saveEntries(entries) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function deleteEntry(id) {
  const remaining = loadEntries().filter((entry) => entry.id !== id)
  saveEntries(remaining)
}

export function sortEntriesNewestFirst(entries) {
  return [...entries].sort((a, b) => (a.ts < b.ts ? 1 : -1))
}
