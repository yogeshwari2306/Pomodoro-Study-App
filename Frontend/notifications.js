// =========================================================
// FocusBuddy — notifications.js
// Stage 9: real browser notifications (Notification API), used
// alongside the in-app toast banner from Stage 2 so the app stays
// useful even if notifications are denied or unsupported.
// =========================================================

const enableNotificationsBtn = document.getElementById('enable-notifications-btn');

// ---------- 1. PERMISSION REQUEST ----------
// Browsers require a genuine user action (like a button click) before
// they'll show the "Allow notifications?" prompt — you can't trigger it
// just by loading the page. So we show a small button instead of asking
// automatically, and only if the browser hasn't already been asked.
function initNotificationPrompt() {
  if (!('Notification' in window)) {
    // This browser doesn't support the Notification API at all.
    // That's OK — the app still works fully via in-app toasts.
    return;
  }

  if (Notification.permission === 'default') {
    enableNotificationsBtn.hidden = false;
  }
}

enableNotificationsBtn.addEventListener('click', async function () {
  const permission = await Notification.requestPermission();
  enableNotificationsBtn.hidden = true;

  if (permission === 'granted') {
    showToast('Notifications enabled! 🔔');
  } else {
    showToast("Notifications blocked — you'll still see in-app alerts here.");
  }
});

// ---------- 2. SENDING NOTIFICATIONS ----------

// The single function everything else calls. ALWAYS shows the in-app
// toast (so the app works no matter what), and ALSO shows a real browser
// notification if the browser supports it and permission was granted.
function notifyUser(title, message) {
  showToast(message); // defined in timer.js — always runs, our safety net

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: message });
  }
}

// Sends the "a new mode just started" notification. Called from timer.js
// right when a fresh Focus session or Break actually begins counting down.
function notifyModeStart(mode) {
  if (mode === 'focus') {
    notifyUser('Focus session started', `Time to concentrate for ${settings.focusMinutes} minutes.`);
  } else if (mode === 'short') {
    notifyUser('Short break started', `Relax for ${settings.shortBreakMinutes} minutes.`);
  } else {
    notifyUser('Long break started', `Take a longer breather for ${settings.longBreakMinutes} minutes.`);
  }
}

// ---------- 3. INITIAL SETUP ----------
initNotificationPrompt();