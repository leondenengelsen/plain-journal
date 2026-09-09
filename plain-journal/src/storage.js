import { Preferences } from '@capacitor/preferences'

const ENTRIES_KEY = 'plain-journal:entries'
const SETTINGS_KEY = 'plain-journal:settings'

const DEFAULT_SETTINGS = {
  reminderEnabled: false,
  reminderTime: '20:00', // "HH:MM", 24-hour — what <input type="time"> gives us
}

// --- Where the data lives ---
// Every value is stored via Capacitor Preferences, which on Android is the
// native SharedPreferences store (an XML file in the app's private data dir).
// That means the OS treats it as real app data: it survives "Clear cache",
// is included in Android's auto-backup, and isn't the WebView storage that
// used to hold this (which a user could wipe and lose every entry).
//
// The trade-off: Preferences.get/set cross the JS<->native bridge, so they're
// async (they return Promises). Everything that reads or writes storage is
// therefore async too, and callers must await it.

// Read one key, or null if it was never set. Preferences.get always resolves
// to an object { value: string | null } — this just unwraps it.
async function readKey(key) {
  const { value } = await Preferences.get({ key })
  return value
}

// Write one key. We always store JSON strings.
async function writeKey(key, data) {
  await Preferences.set({ key, value: JSON.stringify(data) })
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

export async function loadEntries() {
  const raw = await readKey(ENTRIES_KEY)
  if (raw === null) {
    return []
  }
  return JSON.parse(raw)
}

export async function saveEntries(entries) {
  await writeKey(ENTRIES_KEY, entries)
}

export async function deleteEntry(id) {
  const remaining = (await loadEntries()).filter((entry) => entry.id !== id)
  await saveEntries(remaining)
}

// Wipe every entry. Settings are left untouched.
export async function clearAllEntries() {
  await saveEntries([])
}

export function sortEntriesNewestFirst(entries) {
  return [...entries].sort((a, b) => (a.ts < b.ts ? 1 : -1))
}

// All entries as a pretty-printed JSON string — used by the Settings export feature.
export async function entriesAsJSON() {
  return JSON.stringify(await loadEntries(), null, 2)
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
export async function mergeImportedEntries(rawText) {
  const parsed = JSON.parse(rawText) // throws on malformed JSON

  if (!Array.isArray(parsed)) {
    throw new Error('That file isn’t a Plain Journal export (expected a list of entries).')
  }

  const existing = await loadEntries()
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

  await saveEntries([...existing, ...toAdd])

  return { imported: toAdd.length, skipped }
}

export async function loadSettings() {
  const raw = await readKey(SETTINGS_KEY)
  const parsed = raw === null ? {} : JSON.parse(raw)
  // Defaults go underneath, so a setting we add later can't be `undefined`
  // for someone whose saved blob predates it.
  return { ...DEFAULT_SETTINGS, ...parsed }
}

export async function saveSettings(settings) {
  await writeKey(SETTINGS_KEY, settings)
}
