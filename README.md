# sub-agents

> **A live demonstration of GitHub Copilot Sub Agent capabilities and Agent teams.**

This repository shows how you can break a software project into specialised **sub-agents**, each with a focused role, and have them collaborate as an **agent team** to build a complete application together.

---

## 🤖 What are Copilot Sub Agents?

GitHub Copilot Coding Agent can spin up lightweight **sub-agents** — specialised instances that each focus on one area of the codebase (backend, frontend, testing, docs, etc.).  
These sub-agents form an **agent team** that:

- Work in parallel on independent concerns
- Communicate through a shared API contract
- Coordinate hand-offs via agent definition files in `.github/agents/`

---

## 🏗️ The Agent Team in this repo

| Agent | Role | Owns |
|-------|------|------|
| **Backend Agent** | REST API, data models | `src/` |
| **Frontend Agent** | Browser UI | `public/` |
| **Testing Agent** | Jest + Supertest tests | `tests/` |

Each agent has a Markdown definition file in [`.github/agents/`](.github/agents/) that describes its responsibilities, ground rules, and coordination protocol.

---

## 📦 The Application

The team built a **Task Manager** – a full-stack web application with:

- A RESTful Express.js API (`GET / POST / PATCH / DELETE /api/tasks`)
- A responsive vanilla-JS single-page frontend
- Full Jest / Supertest test suite with coverage reporting

### Quick start

```bash
npm install
npm start          # http://localhost:3000
```

### Run tests

```bash
npm test           # runs Jest with coverage
```

---

## 📁 Project structure

```
.github/
  agents/
    backend-agent.md    ← Backend Agent definition
    frontend-agent.md   ← Frontend Agent definition
    testing-agent.md    ← Testing Agent definition

src/
  server.js             ← Express app entry point  (Backend Agent)
  routes/
    tasks.js            ← CRUD routes              (Backend Agent)
  models/
    taskStore.js        ← In-memory data store     (Backend Agent)

public/
  index.html            ← HTML shell               (Frontend Agent)
  styles.css            ← All styles               (Frontend Agent)
  app.js                ← Vanilla JS client        (Frontend Agent)

tests/
  tasks.test.js         ← Integration + unit tests (Testing Agent)

package.json
README.md
```

---

## 🔧 API reference

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | `/api/tasks` | List all tasks | 200 |
| GET | `/api/tasks/:id` | Get one task | 200 / 404 |
| POST | `/api/tasks` | Create a task (`{ title, description? }`) | 201 / 400 |
| PATCH | `/api/tasks/:id` | Update title / description / completed | 200 / 400 / 404 |
| DELETE | `/api/tasks/:id` | Delete a task | 204 / 404 |
| GET | `/health` | Health check | 200 |

---

## 🧠 How agent teams work

```
┌─────────────────────────────────────────────────────┐
│                  Copilot Coding Agent                │
│                  (orchestrator)                      │
└──────────┬──────────────┬──────────────┬────────────┘
           │              │              │
    ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
    │ Backend     │ │ Frontend  │ │ Testing    │
    │ Agent       │ │ Agent     │ │ Agent      │
    │ src/        │ │ public/   │ │ tests/     │
    └─────────────┘ └───────────┘ └────────────┘
```

1. **Orchestrator** reads the issue and decomposes work into sub-tasks.
2. Each **sub-agent** is launched with its own context window and agent definition file.
3. Sub-agents work on isolated file trees and coordinate via the shared API contract.
4. The orchestrator merges results and runs the final validation.

---

## 📝 Agent definition files

Each file in `.github/agents/` tells a sub-agent:

- **Role** – what it is responsible for
- **Ground rules** – conventions to follow
- **Coordination** – which other agents to notify and when

This makes agent behaviour reproducible and reviewable just like any other code.
