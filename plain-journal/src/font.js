const FONT_KEY = 'plain-journal:font'

export function loadFont() {
  return localStorage.getItem(FONT_KEY) === 'serif' ? 'serif' : 'sans'
}

export function saveFont(font) {
  localStorage.setItem(FONT_KEY, font)
}

// Set <html data-theme-font="serif"> (or remove it for sans). index.css keys
// off this: :root[data-theme-font='serif'] redefines --font-family, and every
// component inherits the font from :root, so the whole app switches at once.
export function applyFont(font) {
  if (font === 'serif') {
    document.documentElement.setAttribute('data-theme-font', 'serif')
  } else {
    document.documentElement.removeAttribute('data-theme-font')
  }
}
