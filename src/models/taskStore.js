/**
 * In-memory task store.
 * Created by the Backend Agent as part of the Agent Team demo.
 */

let tasks = [];
let nextId = 1;

function getAll() {
  return [...tasks];
}

function getById(id) {
  return tasks.find((t) => t.id === id) || null;
}

function create({ title, description = "" }) {
  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new Error("title is required");
  }
  const task = {
    id: nextId++,
    title: title.trim(),
    description: description.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

function update(id, changes) {
  const task = getById(id);
  if (!task) return null;
  if (changes.title !== undefined) {
    if (typeof changes.title !== "string" || changes.title.trim() === "") {
      throw new Error("title must be a non-empty string");
    }
    task.title = changes.title.trim();
  }
  if (changes.description !== undefined) {
    task.description = String(changes.description).trim();
  }
  if (changes.completed !== undefined) {
    task.completed = Boolean(changes.completed);
  }
  return task;
}

function remove(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}

function reset() {
  tasks = [];
  nextId = 1;
}

module.exports = { getAll, getById, create, update, remove, reset };
