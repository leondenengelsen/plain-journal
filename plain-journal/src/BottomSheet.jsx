import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

// The shared bottom-sheet shell: dimmed backdrop + a panel that slides up from
// the bottom edge. Tap the backdrop or press Escape to close. The caller puts
// whatever it wants inside.
function BottomSheet({ open, onClose, children }) {
  useEffect(() => {
    if (!open) {
      return
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="sheet-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BottomSheet
