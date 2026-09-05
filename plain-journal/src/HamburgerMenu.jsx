import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'motion/react'

function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleClickOutside(event) {
      if (!menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="hamburger-menu" ref={menuRef}>
      <button
        type="button"
        className="hamburger-icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <Bars3Icon className="hamburger-icon-svg" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            className="menu-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <Link to="/timeline" onClick={() => setIsOpen(false)}>
              Timeline
            </Link>
            <Link to="/settings" onClick={() => setIsOpen(false)}>
              Settings
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HamburgerMenu
