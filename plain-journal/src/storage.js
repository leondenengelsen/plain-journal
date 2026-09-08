const ENTRIES_KEY = 'plain-journal:entries'
const SETTINGS_KEY = 'plain-journal:settings'

const DEFAULT_SETTINGS = {
  reminderEnabled: false,
  reminderTime: '20:00', // "HH:MM", 24-hour — what <input type="time"> gives us
}

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

// Wipe every entry. Settings are left untouched.
export function clearAllEntries() {
  saveEntries([])
}

export function sortEntriesNewestFirst(entries) {
  return [...entries].sort((a, b) => (a.ts < b.ts ? 1 : -1))
}

// All entries as a pretty-printed JSON string — used by the Settings export feature.
export function entriesAsJSON() {
  return JSON.stringify(loadEntries(), null, 2)
}

// An imported item is a valid entry only if it has the exact shape the rest of
// the app assumes: string id, string ts, string text.
function isValidEntry(item) {
  return (
    item != null &&
    typeof item.id === 'string' &&
    typeof item.ts === 'string' &&
    typeof item.text === 'string'
  )
}

// Parse the raw text of an exported JSON file, keep the valid entries whose id
// isn't already stored, save the merged list. Returns { imported, skipped }.
// Throws if the text isn't valid JSON or isn't an array.
export function mergeImportedEntries(rawText) {
  const parsed = JSON.parse(rawText) // throws on malformed JSON

  if (!Array.isArray(parsed)) {
    throw new Error('That file isn’t a Plain Journal export (expected a list of entries).')
  }

  const existing = loadEntries()
  const existingIds = new Set(existing.map((entry) => entry.id))

  const toAdd = []
  let skipped = 0

  for (const item of parsed) {
    if (isValidEntry(item) && !existingIds.has(item.id)) {
      toAdd.push({ id: item.id, ts: item.ts, text: item.text })
      existingIds.add(item.id) // guard against duplicate ids within the file
    } else {
      skipped += 1
    }
  }

  saveEntries([...existing, ...toAdd])

  return { imported: toAdd.length, skipped }
}

export function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY)
  const parsed = raw === null ? {} : JSON.parse(raw)
  // Defaults go underneath, so a setting we add later can't be `undefined`
  // for someone whose saved blob predates it.
  return { ...DEFAULT_SETTINGS, ...parsed }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
