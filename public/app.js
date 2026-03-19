/**
 * Frontend JavaScript for the Agent Team Task Manager.
 * Created by the Frontend Agent as part of the Agent Team demo.
 *
 * Responsibilities:
 *  - Communicate with the REST API built by the Backend Agent
 *  - Render tasks and handle user interactions
 *  - Show toast notifications for feedback
 */

const API = "/api/tasks";
let currentFilter = "all";

/* ── DOM refs ── */
const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descInput = document.getElementById("task-desc");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const taskCountEl = document.getElementById("task-count");
const filterBtns = document.querySelectorAll(".filter-btn");

/* ── Bootstrap ── */
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  form.addEventListener("submit", handleSubmit);
  filterBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      loadTasks();
    })
  );
});

/* ── API helpers ── */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

/* ── Load & render ── */
async function loadTasks() {
  try {
    const all = await apiFetch(API);
    const filtered = all.filter((t) => {
      if (currentFilter === "active") return !t.completed;
      if (currentFilter === "completed") return t.completed;
      return true;
    });
    renderTasks(filtered, all.length);
  } catch (err) {
    toast(`Failed to load tasks: ${err.message}`, true);
  }
}

function renderTasks(tasks, total) {
  taskList.innerHTML = "";

  const active = tasks.filter((t) => !t.completed).length;
  taskCountEl.textContent =
    currentFilter === "all"
      ? `${total} task${total !== 1 ? "s" : ""} (${active} active)`
      : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`;

  if (tasks.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  tasks.forEach((task) => taskList.appendChild(buildTaskEl(task)));
}

function buildTaskEl(task) {
  const li = document.createElement("li");
  li.className = `task-item${task.completed ? " completed" : ""}`;
  li.dataset.id = task.id;

  li.innerHTML = `
    <div class="task-body">
      <div class="task-title">${escapeHtml(task.title)}</div>
      ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ""}
    </div>
    <div class="task-actions">
      <button class="btn btn-icon btn-complete" title="${task.completed ? "Mark active" : "Mark complete"}" aria-label="${task.completed ? "Mark active" : "Mark complete"}">
        ${task.completed ? "↩️" : "✅"}
      </button>
      <button class="btn btn-icon btn-delete" title="Delete task" aria-label="Delete task">🗑️</button>
    </div>
  `;

  li.querySelector(".btn-complete").addEventListener("click", () =>
    toggleComplete(task.id, !task.completed)
  );
  li.querySelector(".btn-delete").addEventListener("click", () =>
    deleteTask(task.id)
  );
  return li;
}

/* ── Form submit ── */
async function handleSubmit(e) {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    toast("Title is required.", true);
    titleInput.focus();
    return;
  }
  try {
    await apiFetch(API, {
      method: "POST",
      body: JSON.stringify({ title, description: descInput.value.trim() }),
    });
    form.reset();
    toast("Task added ✓");
    loadTasks();
  } catch (err) {
    toast(`Error: ${err.message}`, true);
  }
}

/* ── Toggle complete ── */
async function toggleComplete(id, completed) {
  try {
    await apiFetch(`${API}/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed }),
    });
    loadTasks();
  } catch (err) {
    toast(`Error: ${err.message}`, true);
  }
}

/* ── Delete ── */
async function deleteTask(id) {
  try {
    await apiFetch(`${API}/${id}`, { method: "DELETE" });
    toast("Task deleted");
    loadTasks();
  } catch (err) {
    toast(`Error: ${err.message}`, true);
  }
}

/* ── Toast helper ── */
let toastContainer = null;
function toast(message, isError = false) {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }
  const el = document.createElement("div");
  el.className = `toast${isError ? " error" : ""}`;
  el.textContent = message;
  toastContainer.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ── XSS helper ── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
