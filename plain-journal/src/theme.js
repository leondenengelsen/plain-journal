import { useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

const THEME_KEY = 'plain-journal:theme'

// On modern Android (15+, and we target 16) the system forces "edge-to-edge":
// the status bar is always transparent and the WebView draws underneath it, so
// the strip behind the clock/battery simply shows the app's own background. All
// we control from here is the icon colour — dark icons on our light background,
// light icons on the dark one. (setBackgroundColor no longer has any effect on
// this Android version, so we don't call it.) The .app container adds
// padding-top: env(safe-area-inset-top) so the header clears the status bar.
//
// Style.Light  → dark icons  (for a light background)
// Style.Dark   → light icons (for a dark background)
const STATUS_BAR_STYLE = {
  light: Style.Light,
  dark: Style.Dark,
}

function syncStatusBar(theme) {
  if (!Capacitor.isNativePlatform()) {
    return
  }
  StatusBar.setStyle({ style: STATUS_BAR_STYLE[theme] })
}

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
}

// Set <html data-theme="dark"> (or remove the attribute for light). The CSS in
// index.css keys off this: :root[data-theme='dark'] redefines the colour tokens,
// so the whole app repaints the moment this attribute changes — no React involved.
export function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
  syncStatusBar(theme)
}

// Stateful wrapper for components that show/flip the theme. `toggleTheme`
// switches light<->dark, repaints (applyTheme) and persists (saveTheme).
// Note: each caller gets its own state — fine here since applyTheme repaints
// the whole app via CSS regardless; the state just drives the toggle's icon.
export function useTheme() {
  const [theme, setTheme] = useState(loadTheme)

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    // Enable the colour transition only for a user-initiated flip — not the
    // instant apply at startup (main.jsx), which would animate from unstyled.
    document.documentElement.classList.add('theme-anim')
    setTheme(next)
    applyTheme(next)
    saveTheme(next)
  }

  return [theme, toggleTheme]
}
