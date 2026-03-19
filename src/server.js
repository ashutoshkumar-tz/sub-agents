/**
 * Express application entry point.
 * Created by the Backend Agent as part of the Agent Team demo.
 *
 * This server demonstrates what a Backend Agent would produce:
 *   - REST API with full CRUD for tasks
 *   - Static file serving for the frontend built by the Frontend Agent
 *   - Clean separation of concerns (routes, models)
 */

const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const tasksRouter = require("./routes/tasks");

const app = express();

// Apply a generous rate-limit to all routes to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api/tasks", tasksRouter);

// Health-check endpoint used by the Testing Agent
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve the SPA for any other GET request
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

/* istanbul ignore next */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Task Manager running at http://localhost:${PORT}`);
  });
}

module.exports = app;
