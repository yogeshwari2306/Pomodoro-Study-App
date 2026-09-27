// =========================================================
// FocusBuddy — tasks.js
// Stage 5 UPDATE: tasks now live on the backend (in-memory for now,
// real MySQL from Stage 6 onward) instead of localStorage. Every
// add/complete/delete action calls the Spring Boot REST API defined
// in api.js.
// =========================================================

// ---------- 1. GRAB THE HTML ELEMENTS WE NEED ----------
const newTaskInput = document.getElementById('new-task-input');
const newTaskPriority = document.getElementById('new-task-priority');
const addTaskBtn = document.getElementById('add-task-btn');
const taskError = document.getElementById('task-error');

const pendingTaskList = document.getElementById('pending-task-list');
const completedTaskList = document.getElementById('completed-task-list');
const noPendingMsg = document.getElementById('no-pending-msg');
const noCompletedMsg = document.getElementById('no-completed-msg');

// Our in-memory copy of whatever the backend last told us about the tasks.
// We keep this around so we don't have to re-fetch from the server after
// every tiny change.
let tasks = [];

// Tracks which task (if any) was last picked with the "Study ▶" button,
// so timer.js can attach it to a session when a focus session completes.
let selectedTaskId = null;

// ---------- 2. RENDERING ----------

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.dataset.taskId = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', function () {
    toggleTaskCompleted(task.id);
  });

  const titleSpan = document.createElement('span');
  titleSpan.className = 'task-title';
  titleSpan.textContent = task.title;
  if (task.completed) {
    titleSpan.classList.add('task-title-completed');
  }

  li.appendChild(checkbox);
  li.appendChild(titleSpan);

  if (task.priority) {
    const badge = document.createElement('span');
    badge.className = 'priority-badge priority-' + task.priority;
    badge.textContent = task.priority;
    li.appendChild(badge);
  }

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  if (!task.completed) {
    const studyBtn = document.createElement('button');
    studyBtn.className = 'link-btn task-study-btn';
    studyBtn.textContent = 'Study ▶';
    studyBtn.addEventListener('click', function () {
      selectTaskForPomodoro(task);
    });
    actions.appendChild(studyBtn);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'icon-btn task-delete-btn';
  deleteBtn.textContent = '🗑';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.addEventListener('click', function () {
    deleteTask(task.id);
  });
  actions.appendChild(deleteBtn);

  li.appendChild(actions);
  return li;
}

function renderTasks() {
  pendingTaskList.innerHTML = '';
  completedTaskList.innerHTML = '';

  const pending = tasks.filter(function (t) { return !t.completed; });
  const completed = tasks.filter(function (t) { return t.completed; });

  pending.forEach(function (task) {
    pendingTaskList.appendChild(createTaskElement(task));
  });
  completed.forEach(function (task) {
    completedTaskList.appendChild(createTaskElement(task));
  });

  noPendingMsg.hidden = pending.length !== 0;
  noCompletedMsg.hidden = completed.length !== 0;
}

// ---------- 3. TASK ACTIONS (now backed by the API) ----------

// Loads the task list from the backend when the Tasks page first initializes.
async function initTasks() {
  try {
    tasks = await fetchTasks();
    hideGlobalError();
  } catch (err) {
    tasks = [];
    showGlobalError('Could not load tasks — ' + err.message);
  }
  renderTasks();
}

async function addTask() {
  const title = newTaskInput.value.trim();

  // ---- Client-side validation (fast feedback, no network round-trip needed) ----
  if (title === '') {
    showTaskError('Please enter a task name.');
    return;
  }
  if (title.length > 100) {
    showTaskError('Task name is too long (max 100 characters).');
    return;
  }

  hideTaskError();

  // Disable the button briefly so a slow connection can't cause double-adds
  addTaskBtn.disabled = true;

  try {
    const newTask = await createTaskApi({
      title: title,
      priority: newTaskPriority.value || null
    });

    tasks.push(newTask);
    renderTasks();
    hideGlobalError();

    newTaskInput.value = '';
    newTaskPriority.value = '';
    newTaskInput.focus();
  } catch (err) {
    // The backend itself rejected the request (e.g. validation) or is unreachable
    showTaskError(err.message);
  } finally {
    addTaskBtn.disabled = false;
  }
}

async function deleteTask(taskId) {
  try {
    await deleteTaskApi(taskId);
    tasks = tasks.filter(function (t) { return t.id !== taskId; });

    // If the task we just deleted was the one selected for the current
    // Pomodoro session, clear that selection — otherwise the timer would
    // keep silently attaching a now-nonexistent task to future sessions.
    if (selectedTaskId === taskId) {
      selectedTaskId = null;
      currentTaskInput.value = '';
      localStorage.removeItem('currentTaskText');
      const dashboardTaskEl = document.getElementById('current-task-display');
      if (dashboardTaskEl) {
        dashboardTaskEl.textContent = 'No task selected';
      }
    }

    renderTasks();
    hideGlobalError();
  } catch (err) {
    showGlobalError('Could not delete task — ' + err.message);
  }
}

async function toggleTaskCompleted(taskId) {
  const task = tasks.find(function (t) { return t.id === taskId; });
  if (!task) return;

  const newCompletedValue = !task.completed;

  try {
    // We send the full task back (title + priority + new completed value)
    // because our backend's update endpoint expects the complete object.
    const updated = await updateTaskApi(taskId, {
      title: task.title,
      priority: task.priority,
      completed: newCompletedValue
    });
    task.completed = updated.completed;
    hideGlobalError();
  } catch (err) {
    // Leave `tasks` unchanged on failure — re-rendering below will make the
    // checkbox visually "snap back" to its real (unchanged) state.
    showGlobalError('Could not update task — ' + err.message);
  }

  renderTasks();
}

// Fills the task into the Pomodoro page's "current task" field and jumps there
function selectTaskForPomodoro(task) {
  selectedTaskId = task.id;

  currentTaskInput.value = task.title; // defined in timer.js
  localStorage.setItem('currentTaskText', task.title);

  const dashboardTaskEl = document.getElementById('current-task-display');
  if (dashboardTaskEl) {
    dashboardTaskEl.textContent = task.title;
  }

  document.querySelector('.nav-btn[data-page="pomodoro"]').click();
}

// ---------- 4. ERROR MESSAGE HELPERS ----------

function showTaskError(message) {
  taskError.textContent = message;
  taskError.hidden = false;
}

function hideTaskError() {
  taskError.hidden = true;
}

// ---------- 5. WIRE UP EVENTS ----------

addTaskBtn.addEventListener('click', addTask);

newTaskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    addTask();
  }
});

// ---------- 6. INITIAL LOAD ----------
initTasks();