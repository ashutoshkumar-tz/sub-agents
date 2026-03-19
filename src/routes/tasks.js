/**
 * Task routes – RESTful API for the task manager.
 * Created by the Backend Agent as part of the Agent Team demo.
 */

const express = require("express");
const store = require("../models/taskStore");

const router = express.Router();

// GET /api/tasks
router.get("/", (req, res) => {
  res.json(store.getAll());
});

// GET /api/tasks/:id
router.get("/:id", (req, res) => {
  const task = store.getById(Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

// POST /api/tasks
router.post("/", (req, res) => {
  try {
    const task = store.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch("/:id", (req, res) => {
  try {
    const task = store.update(Number(req.params.id), req.body);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", (req, res) => {
  const removed = store.remove(Number(req.params.id));
  if (!removed) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});

module.exports = router;
