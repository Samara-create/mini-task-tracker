const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const VALID_STATUSES = ["To Do", "In Progress", "Done"];

// In-memory store. Resets whenever the server restarts.
let tasks = [
  {
    id: 1,
    title: "Welcome to your Mini Task Tracker",
    description: "This is a sample task. Edit its status or delete it.",
    status: "To Do",
    createdAt: new Date().toISOString(),
  },
];
let nextId = 2;

function findTask(id) {
  return tasks.find((t) => t.id === Number(id));
}

// GET /tasks - list all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id - get a single task
app.get("/tasks/:id", (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

// POST /tasks - create a task
app.post("/tasks", (req, res) => {
  const { title, description, status } = req.body || {};

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : "",
    status: status || "To Do",
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PATCH /tasks/:id - update a task's status and/or details
app.patch("/tasks/:id", (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const { title, description, status } = req.body || {};

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    task.title = title.trim();
  }
  if (description !== undefined) {
    task.description = description.trim();
  }
  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }
    task.status = status;
  }

  res.json(task);
});

// DELETE /tasks/:id - delete a task
app.delete("/tasks/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Task not found" });

  const [deleted] = tasks.splice(index, 1);
  res.json(deleted);
});

app.get("/", (req, res) => {
  res.json({ message: "Mini Task Tracker API is running" });
});

app.listen(PORT, () => {
  console.log(`Mini Task Tracker backend listening on http://localhost:${PORT}`);
});
