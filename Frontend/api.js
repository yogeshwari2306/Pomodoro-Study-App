// =========================================================
// FocusBuddy — api.js
// Stage 5: a small shared helper for talking to the Spring Boot backend.
// Every other JS file (tasks.js, timer.js) calls the functions in here
// instead of using fetch() directly — this keeps error handling
// consistent in one place.
// =========================================================

// Change this if your backend runs on a different port.
const API_BASE_URL = 'http://localhost:8080/api';

// A custom error type so calling code can tell "the server said no"
// (e.g. validation failed) apart from "the server couldn't be reached at all".
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 means "network failure", not an HTTP status
  }
}

// The core function every request goes through.
// path example: '/tasks' or '/tasks/5'
async function apiRequest(path, options = {}) {
  const url = API_BASE_URL + path;

  let response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch (networkError) {
    // This branch runs when the server is down, unreachable, or blocked by CORS.
    throw new ApiError(
      'Could not reach the server. Make sure the backend is running.',
      0
    );
  }

  if (!response.ok) {
    // Try to read a friendly error message from the backend's JSON body,
    // e.g. { "error": "Task title cannot be empty." }
    let message = `Request failed (status ${response.status}).`;
    try {
      const errorBody = await response.json();
      if (errorBody && errorBody.error) {
        message = errorBody.error;
      }
    } catch (parseError) {
      // Backend didn't return JSON — keep the generic message above
    }
    throw new ApiError(message, response.status);
  }

  // DELETE requests (and some others) return an empty body — guard against
  // trying to JSON.parse an empty string.
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// ---------- Tasks ----------
function fetchTasks() {
  return apiRequest('/tasks');
}
function createTaskApi(task) {
  return apiRequest('/tasks', { method: 'POST', body: JSON.stringify(task) });
}
function updateTaskApi(id, task) {
  return apiRequest(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) });
}
function deleteTaskApi(id) {
  return apiRequest(`/tasks/${id}`, { method: 'DELETE' });
}

// ---------- Timer settings ----------
function fetchTimerSettings() {
  return apiRequest('/timer/settings');
}
function updateTimerSettingsApi(settings) {
  return apiRequest('/timer/settings', { method: 'PUT', body: JSON.stringify(settings) });
}

// ---------- Goals ----------
function fetchTodayGoal() {
  return apiRequest('/goals/today');
}
function updateGoalApi(id, goal) {
  return apiRequest(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(goal) });
}

// ---------- Sessions ----------
function fetchSessions() {
  return apiRequest('/sessions');
}
function recordSessionApi(session) {
  return apiRequest('/sessions', { method: 'POST', body: JSON.stringify(session) });
}

// ---------- Global "connection status" banner ----------
// A single shared banner (defined in index.html) used by any page to show
// a friendly message when the backend can't be reached, instead of the
// app silently breaking.
function showGlobalError(message) {
  const banner = document.getElementById('global-error-banner');
  banner.textContent = '⚠️ ' + message;
  banner.hidden = false;
}

function hideGlobalError() {
  const banner = document.getElementById('global-error-banner');
  banner.hidden = true;
}