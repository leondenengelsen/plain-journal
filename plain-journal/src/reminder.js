import { LocalNotifications } from '@capacitor/local-notifications'

// A daily "time to write" reminder that fires even when the app is closed.
//
// This can't be done on the web: only running code can show a Notification, and
// a closed browser tab runs nothing. Capacitor's LocalNotifications plugin hands
// the schedule to Android's AlarmManager, which the OS keeps across app-close and
// reboot. (@capacitor/local-notifications has a web fallback using the browser
// Notification API, so `npm run dev` still behaves sensibly.)
//
// The Settings screen models everything this needs: an enabled flag + an "HH:MM"
// string. These functions are the only glue.

// One fixed id so re-scheduling replaces the previous reminder instead of
// stacking up a new one every time the user nudges the time picker.
const REMINDER_ID = 1

// Android 8+ groups notifications into user-configurable "channels". A channel's
// importance decides how loud a notification is — HIGH (5) means it pops up as a
// heads-up banner, DEFAULT just drops it silently into the shade. Without an
// explicit channel the plugin uses a DEFAULT one, so our reminder never banners.
//
// createChannel is idempotent (safe to call every launch) and a no-op on web.
// Once created, the user can lower a channel's importance but the app can't
// raise it — so if you install, then later bump IMPORTANCE here, existing
// installs keep the old level until the app data is cleared.
const CHANNEL_ID = 'daily-reminder'

// A custom sound bundled at android/app/src/main/res/raw/reminder_sound.wav.
// Android references raw resources by bare filename, no extension. The channel's
// sound is fixed when the channel is first created — changing this later only
// affects fresh installs (or after the user clears app data).
const CHANNEL_SOUND = 'reminder_sound'

export async function initReminders() {
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'Daily reminder',
    description: 'The gentle nudge to write, at the time you choose.',
    importance: 5, // HIGH — heads-up banner + sound
    visibility: 1, // show content on the lock screen
    sound: CHANNEL_SOUND,
  })
}

// Enable a daily reminder at `time` ("HH:MM", 24-hour).
//
// Returns:
//   { ok: true }                       scheduled
//   { ok: false, reason: 'denied' }    the user declined notification permission
//
// Android 13+ requires the user to grant notification permission (like camera or
// location). requestPermissions() shows the system dialog the first time; after
// that it just reports the stored choice. If it's denied, schedule() would
// silently do nothing — so we report it back and let Settings tell the user.
export async function scheduleDailyReminder(time) {
  const permission = await LocalNotifications.requestPermissions()
  if (permission.display !== 'granted') {
    return { ok: false, reason: 'denied' }
  }

  // Clear any existing reminder first, then schedule the new one.
  await cancelDailyReminder()

  const [hour, minute] = time.split(':').map(Number)

  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: 'Your Journal',
        body: "Maybe it's time to write something.",
        channelId: CHANNEL_ID,
        sound: CHANNEL_SOUND,
        // `on` matches calendar fields; with only hour+minute set and
        // repeats:true, it fires once a day at that time.
        schedule: {
          on: { hour, minute },
          repeats: true,
          // Inexact: "around this time" is fine for a daily nudge, and it
          // avoids relying on the SCHEDULE_EXACT_ALARM permission that Google
          // Play restricts. allowWhileIdle keeps it firing in Doze mode.
          allowWhileIdle: true,
        },
      },
    ],
  })

  return { ok: true }
}

export async function cancelDailyReminder() {
  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })
}

// Dev helper: fire a one-off notification a few seconds from now to check the
// whole pipeline (permission -> schedule -> OS delivers it) without waiting for a
// real daily time — scheduled notifications are unreliable on emulators. Not
// wired into any shipped UI; call it from the console or a temporary button.
export async function sendTestNotification() {
  const permission = await LocalNotifications.requestPermissions()
  if (permission.display !== 'granted') {
    return { ok: false, reason: 'denied' }
  }

  await LocalNotifications.schedule({
    notifications: [
      {
        id: 999,
        title: 'Your Journal',
        body: 'Test notification — the pipeline works.',
        channelId: CHANNEL_ID,
        sound: CHANNEL_SOUND,
        schedule: { at: new Date(Date.now() + 5000) }, // 5 seconds from now
      },
    ],
  })

  return { ok: true }
}
