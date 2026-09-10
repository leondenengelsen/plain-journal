import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AppLock from './AppLock.jsx'
import { loadTheme, applyTheme } from './theme.js'
import { loadFont, applyFont } from './font.js'
import { initReminders } from './reminder.js'

// Apply saved display preferences before the first render, so there's no flash
// of the wrong theme or font on launch.
applyTheme(loadTheme())
applyFont(loadFont())

// Ensure the notification channel exists before anything schedules a reminder.
// Fire-and-forget: nothing on screen depends on it, and it no-ops on web.
initReminders()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppLock>
        <App />
      </AppLock>
    </BrowserRouter>
  </StrictMode>,
)
