# Plain Journal — Android app UI kit

Mobile-first recreation of the whole product: four screens plus a full-screen entry editor, 360px design width, built entirely from this system's components.

| File | Screen |
| --- | --- |
| `EntryScreen.jsx` | Home. Auto-focused outlined writing surface, one Save button, hamburger top-right. Nothing else. |
| `TimelineScreen.jsx` | Reverse-chronological entries as hairline-separated rows; optional day filter from the calendar. |
| `EditScreen.jsx` | An existing entry, full screen, pre-filled and editable. Reached by tapping a timeline row. |
| `CalendarScreen.jsx` | Month grid; a dot under days with entries; tapping a day filters the timeline. |
| `SettingsScreen.jsx` | Username, daily reminder toggle + time, JSON export, About. |
| `App.jsx` | Screen state, entry store, menu. |
| `data.js` | Six seeded entries and the date/time formatters. |

Interactive in `index.html`: write and save an entry, open the menu, tap a timeline row and edit it, pick a day in the calendar to filter, toggle the reminder, download the JSON export.

Navigation is deliberately thin — the hamburger menu is the only way between screens, and back arrows return to the Entry screen. There is no tab bar.
