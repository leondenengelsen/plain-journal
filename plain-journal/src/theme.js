import { useState } from 'react'

const THEME_KEY = 'plain-journal:theme'

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
