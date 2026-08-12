require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const Task = require("./models/Task");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL");
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Mini Task Tracker backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Could not connect to MySQL:", err.message);
    process.exit(1);
  }
}

function handleSequelizeError(err, res) {
  if (err.name === "SequelizeValidationError") {
    const message = err.errors[0]?.message || "Invalid data";
    return res.status(400).json({ error: message });
  }
  console.error(err);
  return res.status(500).json({ error: "Something went wrong" });
}

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.findAll({ order: [["createdAt", "ASC"]] });
    res.json(tasks);
  } catch (err) {
    handleSequelizeError(err, res);
  }
});

app.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    handleSequelizeError(err, res);
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { title, description, status } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const task = await Task.create({ title, description, status });
    res.status(201).json(task);
  } catch (err) {
    handleSequelizeError(err, res);
  }
});

app.patch("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const { title, description, status } = req.body || {};

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();
    res.json(task);
  } catch (err) {
    handleSequelizeError(err, res);
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    await task.destroy();
    res.json(task);
  } catch (err) {
    handleSequelizeError(err, res);
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Mini Task Tracker API is running" });
});

start();
