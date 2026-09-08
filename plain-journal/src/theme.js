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
