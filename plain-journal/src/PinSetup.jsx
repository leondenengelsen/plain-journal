import { useState } from 'react'
import { hasPin, savePin, clearPin, verifyPin } from './lock.js'
import PinPad, { PIN_LENGTH } from './PinPad.jsx'

// The set-a-PIN and remove-a-PIN flows, used from Settings.
// - No PIN yet:  enter -> confirm -> save
// - PIN exists:  enter current -> clear
// `onDone(pinNowSet)` tells Settings the final state so it can update its toggle.
function PinSetup({ onDone, onCancel }) {
  const pinExists = hasPin()
  // steps: 'enter' | 'confirm'  (removal only ever uses 'enter')
  const [step, setStep] = useState('enter')
  const [firstPin, setFirstPin] = useState('')
  const [entry, setEntry] = useState('')
  const [error, setError] = useState('')

  const prompt = pinExists
    ? 'Enter your current PIN to turn the lock off'
    : step === 'enter'
      ? 'Choose a 4-digit PIN'
      : 'Enter it again to confirm'

  async function complete(pin) {
    if (pinExists) {
      if (await verifyPin(pin)) {
        clearPin()
        onDone(false)
      } else {
        fail('That PIN is not correct.')
      }
      return
    }

    if (step === 'enter') {
      setFirstPin(pin)
      setEntry('')
      setStep('confirm')
      return
    }

    // step === 'confirm'
    if (pin === firstPin) {
      await savePin(pin)
      onDone(true)
    } else {
      setFirstPin('')
      setStep('enter')
      fail('The PINs did not match. Try again.')
    }
  }

  function fail(message) {
    setError(message)
    setEntry('')
  }

  function press(key) {
    if (error) {
      setError('')
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
      complete(next)
    }
  }

  return (
    <div className="pin-setup">
      <p className="settings-hint">{prompt}</p>
      <PinPad value={entry} onKey={press} error={Boolean(error)} />
      {error && <p className="settings-error">{error}</p>}
      <button type="button" className="settings-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}

export default PinSetup
