// =========================================================
// FocusBuddy — sessions.js
// Stage 7: Session tracking. Pulls the full session history from the
// backend and computes totals, today's stats, a simple weekly chart,
// and a recent-sessions list — all on the frontend, since the backend
// intentionally stays simple (just stores raw session records).
// =========================================================

// ---------- 1. GRAB THE HTML ELEMENTS WE NEED ----------
const totalSessionsEl = document.getElementById('total-sessions');
const totalMinutesEl = document.getElementById('total-minutes');
const sessionsTodayPageEl = document.getElementById('sessions-today-page');
const studyTimeTodayPageEl = document.getElementById('study-time-today-page');
const weeklyChartEl = document.getElementById('weekly-chart');
const recentSessionsListEl = document.getElementById('recent-sessions-list');
const noSessionsMsgEl = document.getElementById('no-sessions-msg');

// ---------- 2. LOAD DATA & COMPUTE STATS ----------

// Fetches sessions (and tasks, so we can show task names) and renders
// the whole Sessions page. Called once when the page loads.
async function loadSessionsPage() {
  let sessions = [];
  let tasksById = {};

  try {
    sessions = await fetchSessions();
    hideGlobalError();
  } catch (err) {
    showGlobalError('Could not load session history — ' + err.message);
  }

  // Fetch tasks too, just so we can show "Complete Java Assignment"
  // instead of a bare task ID in the recent sessions list.
  try {
    const tasks = await fetchTasks();
    tasks.forEach(function (task) {
      tasksById[task.id] = task.title;
    });
  } catch (err) {
    // Not critical if this fails — we'll just show "Unknown task" instead
  }

  renderStatCards(sessions);
  renderWeeklyChart(sessions);
  renderRecentSessions(sessions, tasksById);
}

// Lightweight version used elsewhere (e.g. right after finishing a Pomodoro)
// to refresh just the Dashboard's "Sessions" and "Study Time" cards without
// re-rendering the whole Sessions page.
async function refreshDashboardStats() {
  let sessions = [];
  try {
    sessions = await fetchSessions();
  } catch (err) {
    return; // Dashboard cards simply won't update this time — not critical
  }

  const todaySessions = filterToday(sessions);
  const sessionsTodayEl = document.getElementById('sessions-today');
  const studyTimeTodayEl = document.getElementById('study-time-today');
  if (sessionsTodayEl) sessionsTodayEl.textContent = todaySessions.length;
  if (studyTimeTodayEl) studyTimeTodayEl.textContent = sumDurations(todaySessions);
}

// ---------- 3. HELPERS ----------

function sumDurations(sessionList) {
  return sessionList.reduce(function (total, s) { return total + s.duration; }, 0);
}

function filterToday(sessionList) {
  const todayString = new Date().toDateString();
  return sessionList.filter(function (s) {
    return new Date(s.completedAt).toDateString() === todayString;
  });
}

// ---------- 4. RENDER: STAT CARDS ----------

function renderStatCards(sessions) {
  const todaySessions = filterToday(sessions);

  totalSessionsEl.textContent = sessions.length;
  totalMinutesEl.textContent = sumDurations(sessions);
  sessionsTodayPageEl.textContent = todaySessions.length;
  studyTimeTodayPageEl.textContent = sumDurations(todaySessions);
}

// ---------- 5. RENDER: SIMPLE WEEKLY BAR CHART ----------

function renderWeeklyChart(sessions) {
  weeklyChartEl.innerHTML = '';

  // Build the last 7 days (oldest to newest, ending today)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  // Sum study minutes per day
  const minutesPerDay = days.map(function (day) {
    const dayString = day.toDateString();
    const sessionsThatDay = sessions.filter(function (s) {
      return new Date(s.completedAt).toDateString() === dayString;
    });
    return sumDurations(sessionsThatDay);
  });

  const maxMinutes = Math.max(...minutesPerDay, 1); // avoid divide-by-zero

  days.forEach(function (day, index) {
    const minutes = minutesPerDay[index];
    const heightPercent = Math.round((minutes / maxMinutes) * 100);

    const wrapper = document.createElement('div');
    wrapper.className = 'chart-bar-wrapper';

    const valueLabel = document.createElement('span');
    valueLabel.className = 'chart-bar-value';
    valueLabel.textContent = minutes > 0 ? minutes : '';

    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    // Give even a 0-minute day a tiny sliver so the chart still looks intentional
    bar.style.height = (minutes > 0 ? Math.max(heightPercent, 6) : 3) + '%';

    const dayLabel = document.createElement('span');
    dayLabel.className = 'chart-bar-label';
    dayLabel.textContent = day.toLocaleDateString(undefined, { weekday: 'short' });

    wrapper.appendChild(valueLabel);
    wrapper.appendChild(bar);
    wrapper.appendChild(dayLabel);
    weeklyChartEl.appendChild(wrapper);
  });
}

// ---------- 6. RENDER: RECENT SESSIONS LIST ----------

function formatSessionTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  if (date.toDateString() === now.toDateString()) {
    return 'Today, ' + timeStr;
  }

  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return dateStr + ', ' + timeStr;
}

function renderRecentSessions(sessions, tasksById) {
  recentSessionsListEl.innerHTML = '';

  // Newest first, limited to the most recent 10
  const recent = [...sessions]
    .sort(function (a, b) { return new Date(b.completedAt) - new Date(a.completedAt); })
    .slice(0, 10);

  noSessionsMsgEl.hidden = recent.length !== 0;

  recent.forEach(function (session) {
    const li = document.createElement('li');
    li.className = 'session-item';

    const taskName = document.createElement('span');
    taskName.className = 'session-task-name';
    taskName.textContent = session.taskId && tasksById[session.taskId]
      ? tasksById[session.taskId]
      : 'No task selected';

    const details = document.createElement('span');
    details.className = 'session-details';
    details.textContent = session.duration + ' min · ' + formatSessionTimestamp(session.completedAt);

    li.appendChild(taskName);
    li.appendChild(details);
    recentSessionsListEl.appendChild(li);
  });
}

// ---------- 7. INITIAL LOAD ----------
loadSessionsPage();
refreshDashboardStats();