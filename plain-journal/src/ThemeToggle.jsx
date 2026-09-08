import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from './theme.js'

// Icon button that flips light/dark. Shows the icon for the mode you'd switch
// TO: a moon while light, a sun while dark.
function ThemeToggle() {
  const [theme, toggleTheme] = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <SunIcon className="theme-toggle-icon-sun" />
      ) : (
        <MoonIcon className="theme-toggle-icon-moon" />
      )}
    </button>
  )
}

export default ThemeToggle
