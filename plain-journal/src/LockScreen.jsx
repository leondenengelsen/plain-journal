import { useState } from 'react'
import { verifyPin } from './lock.js'
import PinPad, { PIN_LENGTH } from './PinPad.jsx'

function LockScreen({ onUnlock }) {
  const [entry, setEntry] = useState('')
  const [error, setError] = useState(false)

  async function submit(pin) {
    if (await verifyPin(pin)) {
      onUnlock()
    } else {
      setError(true)
      setEntry('')
    }
  }

  function press(key) {
    if (error) {
      setError(false)
    }
    if (key === '⌫') {
      setEntry((e) => e.slice(0, -1))
      return
    }
    if (entry.length >= PIN_LENGTH) {
      return
    }
    const next = entry + key
    setEntry(next)
    if (next.length === PIN_LENGTH) {
      submit(next)
    }
  }

  return (
    <div className="lock-screen">
      <p className="lock-title">Enter your PIN</p>
      <PinPad value={entry} onKey={press} error={error} />
    </div>
  )
}

export default LockScreen
