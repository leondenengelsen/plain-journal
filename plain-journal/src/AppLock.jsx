import { useState } from 'react'
import { hasPin } from './lock.js'
import LockScreen from './LockScreen.jsx'

// Gate around <App>. If a PIN is set, show the lock screen until it's entered.
// `unlocked` is plain React state with no persistence, so the app re-locks on
// every launch/reload — there's no "stay unlocked" window in v1.
function AppLock({ children }) {
  const [unlocked, setUnlocked] = useState(() => !hasPin())

  if (unlocked) {
    return children
  }

  return <LockScreen onUnlock={() => setUnlocked(true)} />
}

export default AppLock
