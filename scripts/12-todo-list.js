document.addEventListener('DOMContentLoaded', () => {
  // --- Safe localStorage load ---
  let todoList = [];
  try {
    const raw = localStorage.getItem('todoList');
    todoList = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(todoList)) todoList = [];
  } catch (e) {
    console.warn('Resetting todoList due to bad localStorage data.', e);
    localStorage.removeItem('todoList');
    todoList = [];
  }

  const nameInput = document.querySelector('.js-name-input');
  const dateInput = document.querySelector('.js-due-date-input');
  const timeInput = document.querySelector('.js-due-time-input');
  const addBtn = document.querySelector('.js-add-button');
  const listEl = document.querySelector('.js-todo-list');
  const alarmSound = document.getElementById('alarmSound');

  // --- Render ---
  function renderTodoList() {
    let html = '';

    todoList.forEach((todo, index) => {
      const { name, dueDate, dueTime, completed } = todo;
      const displayTime = dueTime ? formatTime12(dueTime) : '—';

      html += `
        <div class="todo-grid">
          <input type="checkbox" class="js-complete-checkbox" data-index="${index}" ${completed ? 'checked' : ''} />
          <div class="${completed ? 'completed' : ''}">${escapeHtml(name)}</div>
          <div>${dueDate || '—'}</div>
          <div>${displayTime}</div>
          <button class="delete-todo-button js-delete-todo-button" data-index="${index}">❌</button>
        </div>
      `;
    });

    listEl.innerHTML = html;

    // Bind delete
    listEl.querySelectorAll('.js-delete-todo-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = Number(e.currentTarget.dataset.index);
        if (!Number.isNaN(i)) {
          todoList.splice(i, 1);
          saveTodos();
          renderTodoList();
        }
      });
    });

    // Bind complete toggles
    listEl.querySelectorAll('.js-complete-checkbox').forEach(box => {
      box.addEventListener('change', (e) => {
        const i = Number(e.currentTarget.dataset.index);
        if (!Number.isNaN(i)) {
          todoList[i].completed = e.currentTarget.checked;

          // Stop alarm if completed
          if (todoList[i].completed && todoList[i].reminded && alarmSound) {
            alarmSound.pause();
            alarmSound.currentTime = 0;
          }

          saveTodos();
          renderTodoList();
        }
      });
    });

    updateStats();
    showRandomQuote();
  }

  // --- Add Todo ---
  function addTodo() {
    const name = (nameInput.value || '').trim();
    const dueDate = (dateInput.value || '').trim();
    const dueTime = (timeInput.value || '').trim();

    if (!name) {
      alert('⚠️ Please enter a task name!');
      nameInput.focus();
      return;
    }

    todoList.push({ name, dueDate, dueTime, completed: false, reminded: false });
    nameInput.value = '';
    dateInput.value = '';
    timeInput.value = '';

    saveTodos();
    renderTodoList();
  }

  // --- Save ---
  function saveTodos() {
    localStorage.setItem('todoList', JSON.stringify(todoList));
  }

  // --- Stats ---
  function updateStats() {
    document.getElementById('taskCount').textContent = `Total: ${todoList.length}`;
    document.getElementById('completedCount').textContent =
      `Completed: ${todoList.filter(t => t.completed).length}`;
  }

  // --- Quotes ---
  function showRandomQuote() {
    const quotes = [
      '💡 Stay focused, stay sharp!',
      '🚀 Small progress is still progress.',
      '🔥 You’re doing great, keep it up!',
      '🌟 Every task completed is a step forward.',
      '✅ Productivity feels awesome!'
    ];
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('quote').textContent = random;
  }

  // --- Helpers ---
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
    ));
  }

  function formatTime12(timeStr) {
    if (!timeStr) return '';
    const [hourStr, minute] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }

  // --- Reminder System ---
  function checkReminders() {
    const now = new Date();

    todoList.forEach(todo => {
      if (todo.dueDate && todo.dueTime && !todo.completed && !todo.reminded) {
        const dueDateTime = new Date(`${todo.dueDate}T${todo.dueTime}`);
        if (dueDateTime <= now) {
          notifyUser(todo.name);
          if (alarmSound) alarmSound.play().catch(err => console.warn("Audio play blocked:", err));
          todo.reminded = true;
          saveTodos();
          renderTodoList();
        }
      }
    });
  }

  function notifyUser(taskName) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ Reminder", { body: taskName });
    } else {
      alert(`⏰ Reminder: ${taskName}`);
    }
  }

  // Request permission for notifications
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // --- Event bindings ---
  addBtn.addEventListener('click', addTodo);
  [nameInput, dateInput, timeInput].forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTodo();
    });
  });

  // Initial render
  renderTodoList();

  // Check reminders every 10s
  setInterval(checkReminders, 10 * 1000);
});
