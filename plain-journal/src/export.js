import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { FilePicker } from '@capawesome/capacitor-file-picker'
import { entriesAsJSON, formatLocalTimestamp } from './storage.js'

// Export every entry as a JSON file the user can save or send somewhere.
//
// On a phone you don't "download" a file — you write it and hand it to the OS
// share sheet, which lets the user drop it into Files, Drive, an email, etc.
// Two Capacitor plugins do this:
//   Filesystem.writeFile — writes the JSON to a real file, returns its uri
//   Share.share          — opens the native share sheet for that file
//
// The file goes in Directory.Cache: it's a throwaway whose only job is to be
// picked up by the share sheet, and the OS is free to clean it up later.
//
// This is native-only. @capacitor/share has no file-sharing fallback on the
// desktop web, so `npm run dev` in a browser can't run this — that's fine, the
// app is tested on the Android emulator.
//
// Returns:
//   { ok: true }                    shared (or the user opened the sheet)
//   { ok: true, cancelled: true }   the user dismissed the share sheet
//   { ok: false, message }          something went wrong
export async function exportEntries() {
  try {
    const json = await entriesAsJSON()
    const today = formatLocalTimestamp().slice(0, 10) // "YYYY-MM-DD"
    const fileName = `your-journal-${today}.json`

    const { uri } = await Filesystem.writeFile({
      path: fileName,
      data: json,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })

    await Share.share({
      title: 'Your Journal export',
      url: uri,
      dialogTitle: 'Save or send your journal',
    })

    return { ok: true }
  } catch (err) {
    // The share plugin throws with this exact message when the user just
    // backs out of the sheet — not a real error.
    if (err?.message === 'Share canceled') {
      return { ok: true, cancelled: true }
    }
    return { ok: false, message: err?.message ?? 'Export failed.' }
  }
}

// Let the user pick a previously-exported JSON file and return its text.
//
// We can't use `<input type="file">` here: on Android the WebView often can't
// read the content:// URI the system picker hands back (a NotReadableError,
// "The requested file could not be read"). The FilePicker plugin instead returns
// a real native `path`, and Filesystem.readFile reads it with native file APIs
// that do have access.
//
// Returns:
//   { ok: true, text }              the file's contents
//   { ok: true, cancelled: true }   the user closed the picker without choosing
//   { ok: false, message }          couldn't read the file
export async function pickEntriesFileText() {
  let path
  try {
    const { files } = await FilePicker.pickFiles({
      types: ['application/json'],
      limit: 1,
    })
    if (!files || files.length === 0) {
      return { ok: true, cancelled: true }
    }
    path = files[0].path
  } catch (err) {
    // The plugin throws "pickFiles canceled" when the user backs out.
    if (err?.message?.toLowerCase().includes('cancel')) {
      return { ok: true, cancelled: true }
    }
    return { ok: false, message: err?.message ?? 'Could not open the file picker.' }
  }

  try {
    const { data } = await Filesystem.readFile({
      path,
      encoding: Encoding.UTF8,
    })
    return { ok: true, text: data }
  } catch (err) {
    return { ok: false, message: err?.message ?? 'Could not read that file.' }
  }
}
