import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";
const STATUSES = ["To Do", "In Progress", "Done"];
const STATUS_EMOJI = { "To Do": "📝", "In Progress": "🌱", Done: "🎀" };

function ProgressBlob({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="blob">
      <span className="blob-pct">{pct}%</span>
      <span className="blob-label">tidied up</span>
    </div>
  );
}

function Sparkles() {
  return (
    <span className="sparkles" aria-hidden="true">
      <span className="spark s1">✦</span>
      <span className="spark s2">✧</span>
      <span className="spark s3">✦</span>
    </span>
  );
}

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
      setFormError("Give it a little title first!");
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
      setTasks(prevTasks);
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
        <div className="header-top">
          <div>
            <h1>Mini Task Tracker <span className="wave">🌸</span></h1>
            <p className="subtitle">A cozy little list for cozy little wins.</p>
          </div>
          {!loading && tasks.length > 0 && (
            <ProgressBlob
              done={tasks.filter((t) => t.status === "Done").length}
              total={tasks.length}
            />
          )}
        </div>
      </header>

      <form className="task-form" onSubmit={handleCreate}>
        <div className="field">
          <label htmlFor="title">What's the task?</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Water the plants 🪴"
          />
        </div>
        <div className="field">
          <label htmlFor="description">Any little details?</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional — jot down the specifics"
            rows={2}
          />
        </div>
        {formError && <p className="error">{formError}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add it! ✨"}
        </button>
      </form>

      {error && <p className="error banner">{error}</p>}

      {loading ? (
        <p className="empty">Loading your tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji">🌤️</span>
          <p>All clear! Add your first task above.</p>
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-card" data-status={task.status}>
              {task.status === "Done" && <Sparkles />}
              <div className="task-main">
                <h3>{task.title}</h3>
                {task.description && <p>{task.description}</p>}
              </div>
              <div className="task-actions">
                <select
                  className="status-select"
                  data-status={task.status}
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_EMOJI[s]} {s}
                    </option>
                  ))}
                </select>
                <button
                  className="delete-btn"
                  onClick={() => deleteTask(task.id)}
                >
                  remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
