const PIN_HASH_KEY = 'plain-journal:pin-hash'

// SHA-256 of the PIN, as a hex string. crypto.subtle is the browser's built-in
// Web Crypto API — it works on bytes (hence TextEncoder) and is async (hence
// the Promise). We hash so the stored value isn't the PIN itself.
//
// This is NOT encryption and NOT a strong defence: a 4-digit PIN has only
// 10,000 possibilities, and the journal entries stay in plain localStorage
// regardless. It stops someone casually poking around, not someone determined.
export async function hashPin(pin) {
  const bytes = new TextEncoder().encode(pin)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function hasPin() {
  return localStorage.getItem(PIN_HASH_KEY) !== null
}

export function loadPinHash() {
  return localStorage.getItem(PIN_HASH_KEY)
}

export async function savePin(pin) {
  localStorage.setItem(PIN_HASH_KEY, await hashPin(pin))
}

export function clearPin() {
  localStorage.removeItem(PIN_HASH_KEY)
}

export async function verifyPin(pin) {
  const stored = loadPinHash()
  if (stored === null) {
    return false
  }
  return (await hashPin(pin)) === stored
}
