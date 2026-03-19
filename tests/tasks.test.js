/**
 * Integration tests for the Task Manager REST API.
 * Created by the Testing Agent as part of the Agent Team demo.
 *
 * The Testing Agent's role is to validate every contract exposed by the
 * Backend Agent's routes and catch any regressions early.
 */

const request = require("supertest");
const app = require("../src/server");
const store = require("../src/models/taskStore");

beforeEach(() => store.reset());
afterAll(() => store.reset());

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
describe("GET /health", () => {
  it("returns status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// GET /api/tasks
// ─────────────────────────────────────────────
describe("GET /api/tasks", () => {
  it("returns an empty array when no tasks exist", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all created tasks", async () => {
    store.create({ title: "Task A" });
    store.create({ title: "Task B", description: "desc" });
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe("Task A");
    expect(res.body[1].title).toBe("Task B");
  });
});

// ─────────────────────────────────────────────
// GET /api/tasks/:id
// ─────────────────────────────────────────────
describe("GET /api/tasks/:id", () => {
  it("returns the task with the given id", async () => {
    const task = store.create({ title: "Read me" });
    const res = await request(app).get(`/api/tasks/${task.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(task.id);
    expect(res.body.title).toBe("Read me");
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/tasks/9999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });
});

// ─────────────────────────────────────────────
// POST /api/tasks
// ─────────────────────────────────────────────
describe("POST /api/tasks", () => {
  it("creates a task with a title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "New task" });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe("New task");
    expect(res.body.completed).toBe(false);
    expect(res.body.createdAt).toBeTruthy();
  });

  it("creates a task with title and description", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "With desc", description: "Some details" });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe("Some details");
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app).post("/api/tasks").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it("returns 400 when title is an empty string", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "   " });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// PATCH /api/tasks/:id
// ─────────────────────────────────────────────
describe("PATCH /api/tasks/:id", () => {
  it("marks a task as completed", async () => {
    const task = store.create({ title: "Mark me done" });
    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("updates the task title", async () => {
    const task = store.create({ title: "Old title" });
    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .send({ title: "New title" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("New title");
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app)
      .patch("/api/tasks/9999")
      .send({ completed: true });
    expect(res.status).toBe(404);
  });

  it("returns 400 when title is set to empty string", async () => {
    const task = store.create({ title: "Valid" });
    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .send({ title: "" });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// DELETE /api/tasks/:id
// ─────────────────────────────────────────────
describe("DELETE /api/tasks/:id", () => {
  it("deletes an existing task and returns 204", async () => {
    const task = store.create({ title: "Delete me" });
    const res = await request(app).delete(`/api/tasks/${task.id}`);
    expect(res.status).toBe(204);
    expect(store.getById(task.id)).toBeNull();
  });

  it("returns 404 when deleting a non-existent task", async () => {
    const res = await request(app).delete("/api/tasks/9999");
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────
// taskStore unit tests
// ─────────────────────────────────────────────
describe("taskStore", () => {
  describe("create", () => {
    it("assigns incrementing IDs", () => {
      const t1 = store.create({ title: "First" });
      const t2 = store.create({ title: "Second" });
      expect(t2.id).toBe(t1.id + 1);
    });

    it("trims whitespace from title and description", () => {
      const t = store.create({ title: "  hi  ", description: "  desc  " });
      expect(t.title).toBe("hi");
      expect(t.description).toBe("desc");
    });

    it("throws when title is not provided", () => {
      expect(() => store.create({})).toThrow("title is required");
    });
  });

  describe("update", () => {
    it("returns null for unknown id", () => {
      expect(store.update(999, { title: "x" })).toBeNull();
    });

    it("updates description", () => {
      const t = store.create({ title: "t" });
      store.update(t.id, { description: "new desc" });
      expect(store.getById(t.id).description).toBe("new desc");
    });
  });

  describe("remove", () => {
    it("returns false for unknown id", () => {
      expect(store.remove(999)).toBe(false);
    });

    it("removes the task from the list", () => {
      const t = store.create({ title: "Gone" });
      expect(store.remove(t.id)).toBe(true);
      expect(store.getAll()).toHaveLength(0);
    });
  });
});
