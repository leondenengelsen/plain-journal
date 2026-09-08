// STUB — no real notification fires yet.
//
// A daily reminder must fire when the app is CLOSED. The web can't do that:
// only currently-running code can show a Notification, and a closed tab runs
// no code. Real scheduling needs the operating system to hold the alarm.
//
// Phase 7 (Capacitor): replace the bodies below with @capacitor/local-notifications
//   import { LocalNotifications } from '@capacitor/local-notifications'
//   scheduleDailyReminder(time):
//     const [hour, minute] = time.split(':').map(Number)
//     await LocalNotifications.requestPermissions()
//     await LocalNotifications.schedule({ notifications: [{
//       id: 1, title: 'Plain Journal', body: 'Time to write.',
//       schedule: { on: { hour, minute }, repeats: true },
//     }] })
//   cancelDailyReminder():
//     await LocalNotifications.cancel({ notifications: [{ id: 1 }] })
//
// The Settings screen and storage already model everything this needs
// (an enabled flag + an "HH:MM" string), so only these two functions change.

export function scheduleDailyReminder(time) {
  console.info(`[reminder] would schedule a daily reminder at ${time} (stub — no OS alarm yet)`)
}

export function cancelDailyReminder() {
  console.info('[reminder] would cancel the daily reminder (stub — nothing scheduled)')
}
