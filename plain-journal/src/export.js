import { entriesAsJSON, formatLocalTimestamp } from './storage.js'

// Web stand-in for Capacitor Filesystem + Share.
// On real Android (Phase 7) the body of this function becomes:
//   const path = ... ; await Filesystem.writeFile({ path, data, directory, encoding })
//   await Share.share({ url: fileUri })   // opens the native share sheet
// The Settings screen just calls downloadEntriesJSON() either way — its call site
// doesn't change.
export function downloadEntriesJSON() {
  const json = entriesAsJSON()

  // A Blob is an in-memory, file-like bag of bytes with a MIME type.
  const blob = new Blob([json], { type: 'application/json' })

  // An <a> needs a URL to point at. Our "file" isn't on a server, so mint a
  // temporary blob: URL that resolves to the Blob locally.
  const url = URL.createObjectURL(blob)

  const today = formatLocalTimestamp().slice(0, 10) // "YYYY-MM-DD"
  const link = document.createElement('a')
  link.href = url
  link.download = `plain-journal-${today}.json`
  link.click()

  // The blob: URL keeps the Blob alive in memory. We're done — free it.
  URL.revokeObjectURL(url)
}
