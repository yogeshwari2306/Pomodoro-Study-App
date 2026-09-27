// =========================================================
// FocusBuddy — timer.js
// Stage 2: the Pomodoro countdown timer.
//
// IMPORTANT DESIGN NOTE:
// We do NOT just subtract 1 second every tick. Browsers slow
// down (or fully pause) JavaScript timers on inactive tabs,
// so a simple "remaining--" counter would drift or freeze.
// Instead we store the exact clock time the session should
// END (endTimestamp), and every tick we recalculate
// "remaining = endTimestamp - now". This stays accurate even
// if the tab was inactive for a while.
// =========================================================

// ---------- 1. SETTINGS ----------
// Stage 5 UPDATE: settings now live on the backend (in-memory for now,
// real MySQL from Stage 6 onward) instead of localStorage.

const DEFAULT_SETTINGS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4
};

// Start with defaults immediately so the page has something to show
// right away; initSettings() below will fetch the real values shortly after.
let settings = { ...DEFAULT_SETTINGS };

// Fetches the real settings from the backend once the page loads.
async function initSettings() {
  try {
    settings = await fetchTimerSettings();
    hideGlobalError();
  } catch (err) {
    // Backend unreachable — keep using the defaults so the app still works
    showGlobalError('Could not load timer settings from the server (using defaults) — ' + err.message);
  }

  // Only refresh the on-screen countdown if nothing is currently running,
  // so we don't yank the timer out from under an active session.
  if (!isRunning) {
    remainingSeconds = getDurationForMode(currentMode) * 60;
    updateTimerDisplay();
    updateSessionCounter();
  }
}

// ---------- 2. TIMER STATE ----------
// currentMode is one of: 'focus', 'short', 'long'
let currentMode = 'focus';

let remainingSeconds = settings.focusMinutes * 60;
let endTimestamp = null;     // set only while the timer is actively running
let intervalId = null;       // holds the setInterval reference so we can stop it
let isRunning = false;
let isPaused = false;

// How many focus sessions completed in the current cycle (resets after a long break)
let sessionsCompletedInCycle = 0;

// ---------- 3. GRAB THE HTML ELEMENTS WE NEED ----------
const modeBadge = document.getElementById('mode-badge');
const timerDisplay = document.getElementById('timer-display');
const sessionCounter = document.getElementById('session-counter');
const currentTaskInput = document.getElementById('current-task-input');
const toastBanner = document.getElementById('toast-banner');

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const resetBtn = document.getElementById('reset-btn');
const skipBtn = document.getElementById('skip-btn');

// ---------- 4. DISPLAY HELPERS ----------

// Converts total seconds into a "MM:SS" string, e.g. 65 -> "01:05"
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(Math.max(0, remainingSeconds));
}

function updateModeBadge() {
  if (currentMode === 'focus') {
    modeBadge.textContent = 'FOCUS SESSION';
    modeBadge.classList.remove('break-mode');
  } else if (currentMode === 'short') {
    modeBadge.textContent = 'SHORT BREAK';
    modeBadge.classList.add('break-mode');
  } else {
    modeBadge.textContent = 'LONG BREAK';
    modeBadge.classList.add('break-mode');
  }
}

function updateSessionCounter() {
  // Session count shown to the user is 1-indexed (Session 1 of 4, not 0 of 4)
  const displayCount = (sessionsCompletedInCycle % settings.sessionsBeforeLongBreak) + 1;
  sessionCounter.textContent = `Session ${displayCount} of ${settings.sessionsBeforeLongBreak}`;
}

// Shows a small temporary message inside the app (a "toast").
// This is our stand-in until Stage 9 adds real browser notifications.
function showToast(message) {
  toastBanner.textContent = message;
  toastBanner.hidden = false;

  // Hide it again automatically after 4 seconds
  clearTimeout(showToast.hideTimer);
  showToast.hideTimer = setTimeout(function () {
    toastBanner.hidden = true;
  }, 4000);
}

// Shows/hides the correct combination of buttons for the current state
function updateButtonVisibility() {
  startBtn.hidden = isRunning;
  pauseBtn.hidden = !isRunning || isPaused;
  resumeBtn.hidden = !isPaused;
}

// ---------- 5. CORE TIMER ENGINE ----------

// Called roughly every second while the timer is running.
function tick() {
  const now = Date.now();
  const msRemaining = endTimestamp - now;

  remainingSeconds = Math.max(0, Math.round(msRemaining / 1000));
  updateTimerDisplay();

  if (msRemaining <= 0) {
    handleSessionComplete();
  }
}

function startTimer() {
  if (isRunning && !isPaused) return; // already running, nothing to do

  // This function is only ever called for a genuinely FRESH start (manual
  // Start button click, or an automatic mode transition) — resumeTimer()
  // has its own separate logic and never calls this. So this is exactly
  // the right place to announce "a new session just began".
  notifyModeStart(currentMode); // defined in notifications.js

  isRunning = true;
  isPaused = false;

  // Calculate the exact moment this session should end
  endTimestamp = Date.now() + remainingSeconds * 1000;

  // Run tick() every 500ms (twice a second) for a smoother, more accurate countdown
  intervalId = setInterval(tick, 500);

  updateButtonVisibility();
}

function pauseTimer() {
  if (!isRunning || isPaused) return;

  isPaused = true;
  clearInterval(intervalId);

  // Freeze remainingSeconds at its current value (already up to date from the last tick)
  updateButtonVisibility();
}

function resumeTimer() {
  if (!isPaused) return;
  isPaused = false;

  // Recalculate endTimestamp based on however much time was left when paused
  endTimestamp = Date.now() + remainingSeconds * 1000;
  intervalId = setInterval(tick, 500);

  updateButtonVisibility();
}

function resetTimer() {
  clearInterval(intervalId);
  isRunning = false;
  isPaused = false;
  remainingSeconds = getDurationForMode(currentMode) * 60;
  updateTimerDisplay();
  updateButtonVisibility();
}

// Skips straight to the next mode without waiting for the countdown to finish
function skipTimer() {
  clearInterval(intervalId);
  isRunning = false;
  isPaused = false;
  moveToNextMode(/* wasSkipped = */ true);
}

// Returns how many minutes a given mode should last, based on current settings
function getDurationForMode(mode) {
  if (mode === 'focus') return settings.focusMinutes;
  if (mode === 'short') return settings.shortBreakMinutes;
  return settings.longBreakMinutes;
}

// ---------- 6. SESSION COMPLETION & MODE TRANSITIONS ----------

function handleSessionComplete() {
  clearInterval(intervalId);
  isRunning = false;
  isPaused = false;

  if (currentMode === 'focus') {
    // A focus session just finished — record it and update stats.
    sessionsCompletedInCycle++;
    recordCompletedFocusSession();
    notifyUser('Focus session complete!', `Time for a ${nextBreakLabel()} break.`);
  } else {
    notifyUser('Break is over', 'Ready for another focus session?');
  }

  moveToNextMode(/* wasSkipped = */ false);
}

// Figures out whether the next break should be "short" or "long"
function nextBreakLabel() {
  const isLongBreakNext = sessionsCompletedInCycle % settings.sessionsBeforeLongBreak === 0;
  return isLongBreakNext ? settings.longBreakMinutes + '-minute' : settings.shortBreakMinutes + '-minute';
}

function moveToNextMode(wasSkipped) {
  if (currentMode === 'focus') {
    // Decide: short break or long break?
    const isLongBreakNext = sessionsCompletedInCycle > 0 &&
      sessionsCompletedInCycle % settings.sessionsBeforeLongBreak === 0;
    currentMode = isLongBreakNext ? 'long' : 'short';
  } else {
    // Any break (short or long) is always followed by a focus session
    currentMode = 'focus';
  }

  remainingSeconds = getDurationForMode(currentMode) * 60;
  updateModeBadge();
  updateSessionCounter();
  updateTimerDisplay();
  updateButtonVisibility();

  // Automatically start the next session/break (per the spec) unless the
  // user manually skipped — either way, auto-continuing keeps the flow going.
  startTimer();
}

// ---------- 7. STATS ----------
// Stage 7 UPDATE: completed sessions are saved to the backend via
// POST /api/sessions, and the Dashboard's "Sessions" and "Study Time"
// cards are now refreshed with REAL totals fetched from the backend
// (via refreshDashboardStats(), defined in sessions.js) instead of a
// localStorage stopgap.

async function recordCompletedFocusSession() {
  const sessionPayload = {
    taskId: selectedTaskId,           // may be null if no task was selected — that's fine
    duration: settings.focusMinutes,
    sessionType: 'focus'
  };

  try {
    await recordSessionApi(sessionPayload);
    hideGlobalError();
  } catch (err) {
    showGlobalError('Focus session finished, but could not save it to the server — ' + err.message);
  }

  // Re-fetch today's totals from the backend and update the Dashboard cards
  // (refreshDashboardStats is defined in sessions.js)
  refreshDashboardStats();

  // Add these minutes onto today's goal automatically (defined in goals.js)
  updateGoalProgress(settings.focusMinutes);
}

// ---------- 8. CUSTOM SETTINGS PANEL ----------

const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const focusInput = document.getElementById('focus-input');
const shortBreakInput = document.getElementById('short-break-input');
const longBreakInput = document.getElementById('long-break-input');
const sessionsInput = document.getElementById('sessions-input');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const settingsError = document.getElementById('settings-error');

// Fill the settings inputs with the currently active values
function populateSettingsInputs() {
  focusInput.value = settings.focusMinutes;
  shortBreakInput.value = settings.shortBreakMinutes;
  longBreakInput.value = settings.longBreakMinutes;
  sessionsInput.value = settings.sessionsBeforeLongBreak;
}

toggleSettingsBtn.addEventListener('click', function () {
  settingsPanel.hidden = !settingsPanel.hidden;
  if (!settingsPanel.hidden) {
    populateSettingsInputs();
  }
});

function showSettingsError(message) {
  settingsError.textContent = message;
  settingsError.hidden = false;
}

function hideSettingsError() {
  settingsError.hidden = true;
}

saveSettingsBtn.addEventListener('click', async function () {
  hideSettingsError();

  const focusVal = parseInt(focusInput.value, 10);
  const shortVal = parseInt(shortBreakInput.value, 10);
  const longVal = parseInt(longBreakInput.value, 10);
  const sessionsVal = parseInt(sessionsInput.value, 10);

  // ---- Client-side validation first (fast feedback, no network round-trip) ----
  if (
    !Number.isInteger(focusVal) || focusVal < 1 || focusVal > 180 ||
    !Number.isInteger(shortVal) || shortVal < 1 || shortVal > 60 ||
    !Number.isInteger(longVal) || longVal < 1 || longVal > 90 ||
    !Number.isInteger(sessionsVal) || sessionsVal < 1 || sessionsVal > 10
  ) {
    showSettingsError('Please enter valid numbers within the allowed ranges.');
    return;
  }

  const newSettings = {
    focusMinutes: focusVal,
    shortBreakMinutes: shortVal,
    longBreakMinutes: longVal,
    sessionsBeforeLongBreak: sessionsVal
  };

  saveSettingsBtn.disabled = true;
  try {
    // The backend re-validates too and is the source of truth
    settings = await updateTimerSettingsApi(newSettings);
    hideGlobalError();

    if (!isRunning) {
      remainingSeconds = getDurationForMode(currentMode) * 60;
      updateTimerDisplay();
      updateSessionCounter();
    }

    showToast('Settings saved!');
    settingsPanel.hidden = true;
  } catch (err) {
    showSettingsError(err.message);
  } finally {
    saveSettingsBtn.disabled = false;
  }
});

// ---------- 9. WIRE UP THE BUTTONS ----------

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resumeBtn.addEventListener('click', resumeTimer);
resetBtn.addEventListener('click', resetTimer);
skipBtn.addEventListener('click', skipTimer);

// Keep the "current task" text remembered across a page reload (simple UX touch)
currentTaskInput.value = localStorage.getItem('currentTaskText') || '';
currentTaskInput.addEventListener('input', function () {
  localStorage.setItem('currentTaskText', currentTaskInput.value);
  const dashboardTaskEl = document.getElementById('current-task-display');
  if (dashboardTaskEl) {
    dashboardTaskEl.textContent = currentTaskInput.value || 'No task selected';
  }
});

// Reflect any saved task on the Dashboard when the page first loads
(function initCurrentTaskOnLoad() {
  const savedTask = localStorage.getItem('currentTaskText');
  const dashboardTaskEl = document.getElementById('current-task-display');
  if (savedTask && dashboardTaskEl) {
    dashboardTaskEl.textContent = savedTask;
  }
})();

// ---------- 10. INITIAL RENDER ----------
// Draw the correct starting state as soon as the page loads
updateModeBadge();
updateSessionCounter();
updateTimerDisplay();
updateButtonVisibility();

// Fetch the real settings from the backend (falls back to defaults on failure)
initSettings();