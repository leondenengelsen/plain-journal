import { motion } from 'motion/react'

export const PIN_LENGTH = 4
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

// Presentational: 4 dots + a number pad. The parent owns the entered value and
// decides what each key does.
function PinPad({ value, onKey, error }) {
  return (
    <div className="pin-pad-wrap">
      <motion.div
        className="lock-dots"
        animate={error ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
      >
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <span key={i} className={i < value.length ? 'lock-dot lock-dot-filled' : 'lock-dot'} />
        ))}
      </motion.div>

      <div className="lock-pad">
        {KEYS.map((key, i) =>
          key === '' ? (
            <span key={i} />
          ) : (
            <button key={i} type="button" className="lock-key" onClick={() => onKey(key)}>
              {key}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

export default PinPad
