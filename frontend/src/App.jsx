import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";
const STATUSES = ["To Do", "In Progress", "Done"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadTasks() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/tasks`);
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(
        "Couldn't reach the backend. Is it running on http://localhost:5000?"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create task");
        return;
      }
      setTasks((prev) => [...prev, data]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setFormError("Couldn't reach the backend.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id, status) {
    const prevTasks = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setTasks(prevTasks); // roll back on failure
      setError("Couldn't update that task. Try again.");
    }
  }

  async function deleteTask(id) {
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      setTasks(prevTasks);
      setError("Couldn't delete that task. Try again.");
    }
  }

  return (
    <div className="page">
      <header>
        <h1>Mini Task Tracker</h1>
        <p className="subtitle">Create, track, and manage your tasks</p>
      </header>

      <form className="task-form" onSubmit={handleCreate}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Draft project README"
          />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details"
            rows={2}
          />
        </div>
        {formError && <p className="error">{formError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Task"}
        </button>
      </form>

      {error && <p className="error banner">{error}</p>}

      {loading ? (
        <p className="empty">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="empty">No tasks yet. Add one above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-card">
              <div className="task-main">
                <h3>{task.title}</h3>
                {task.description && <p>{task.description}</p>}
              </div>
              <div className="task-actions">
                <select
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
