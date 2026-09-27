// =========================================================
// FocusBuddy — goals.js
// Stage 8: Daily study goals. Pulls today's goal from the backend
// (which auto-creates a 120-minute default if none exists yet) and
// keeps both the Dashboard card and the Goals page in sync.
// =========================================================

// ---------- 1. GRAB THE HTML ELEMENTS WE NEED ----------
const goalTargetInput = document.getElementById('goal-target-input');
const saveGoalBtn = document.getElementById('save-goal-btn');
const goalError = document.getElementById('goal-error');

// ---------- 2. RENDERING ----------
// Updates BOTH the Dashboard's goal card (ids without "-page") and the
// Goals page's own card (ids with "-page"), whichever happen to exist
// in the current HTML — this way one function keeps everything in sync.
function renderGoalDisplay(goal) {
  // Per the spec: completed study time should never make the progress bar
  // go past 100%, even if the student studies more than their target.
  const percent = Math.min(100, Math.round((goal.completedMinutes / goal.targetMinutes) * 100));
  const remaining = Math.max(0, goal.targetMinutes - goal.completedMinutes);

  // ---- Dashboard elements (from Stage 1) ----
  const dashCompleted = document.getElementById('goal-completed');
  const dashTarget = document.getElementById('goal-target');
  const dashFill = document.getElementById('goal-progress-fill');
  if (dashCompleted) dashCompleted.textContent = goal.completedMinutes;
  if (dashTarget) dashTarget.textContent = goal.targetMinutes;
  if (dashFill) dashFill.style.width = percent + '%';

  // ---- Goals page elements ----
  const pageCompleted = document.getElementById('goal-completed-page');
  const pageTarget = document.getElementById('goal-target-page');
  const pageFill = document.getElementById('goal-progress-fill-page');
  const remainingText = document.getElementById('goal-remaining-text');
  if (pageCompleted) pageCompleted.textContent = goal.completedMinutes;
  if (pageTarget) pageTarget.textContent = goal.targetMinutes;
  if (pageFill) pageFill.style.width = percent + '%';
  if (remainingText) {
    remainingText.textContent = `${remaining} min remaining (${percent}%)`;
  }
}

// ---------- 3. LOADING & SAVING ----------

// Fetches today's goal and renders it everywhere. Returns the goal object
// (or null on failure) in case the caller needs it too.
async function refreshGoalDisplay() {
  try {
    const goal = await fetchTodayGoal();
    renderGoalDisplay(goal);
    hideGlobalError();
    return goal;
  } catch (err) {
    showGlobalError("Could not load today's goal — " + err.message);
    return null;
  }
}

// Runs once when the page first loads: renders the goal AND fills in the
// "Set Today's Target" input with the current value.
async function initGoalsPage() {
  const goal = await refreshGoalDisplay();
  if (goal && goalTargetInput) {
    goalTargetInput.value = goal.targetMinutes;
  }
}

// Called by the "Save Goal" button
async function saveGoal() {
  hideGoalError();

  const newTarget = parseInt(goalTargetInput.value, 10);

  // ---- Validation ----
  if (!Number.isInteger(newTarget) || newTarget < 1 || newTarget > 1440) {
    showGoalError('Please enter a target between 1 and 1440 minutes.');
    return;
  }

  saveGoalBtn.disabled = true;
  try {
    // We need the goal's real id and its current completedMinutes before
    // we can PUT an update (our backend expects the full object).
    const currentGoal = await fetchTodayGoal();
    const updated = await updateGoalApi(currentGoal.id, {
      targetMinutes: newTarget,
      completedMinutes: currentGoal.completedMinutes
    });
    renderGoalDisplay(updated);
    hideGlobalError();
  } catch (err) {
    showGoalError(err.message);
  } finally {
    saveGoalBtn.disabled = false;
  }
}

// Called by timer.js whenever a focus session finishes, to add those
// minutes onto today's goal automatically.
async function updateGoalProgress(minutesToAdd) {
  try {
    const goal = await fetchTodayGoal();
    const updated = await updateGoalApi(goal.id, {
      targetMinutes: goal.targetMinutes,
      completedMinutes: goal.completedMinutes + minutesToAdd
    });
    renderGoalDisplay(updated);
    hideGlobalError();
  } catch (err) {
    showGlobalError("Could not update today's goal progress — " + err.message);
  }
}

// ---------- 4. ERROR MESSAGE HELPERS ----------

function showGoalError(message) {
  goalError.textContent = message;
  goalError.hidden = false;
}

function hideGoalError() {
  goalError.hidden = true;
}

// ---------- 5. WIRE UP EVENTS ----------

saveGoalBtn.addEventListener('click', saveGoal);

// ---------- 6. INITIAL LOAD ----------
initGoalsPage();