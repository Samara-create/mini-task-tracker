import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";
const STATUSES = ["To Do", "In Progress", "Done"];

function ProgressRing({ done, total }) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total === 0 ? 0 : done / total;
  const offset = circumference * (1 - pct);

  return (
    <div className="ring-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="ring-progress"
        />
      </svg>
      <div className="ring-label">
        <strong>{done}</strong>
        <span>/{total}</span>
      </div>
    </div>
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
        <div className="header-top">
          <div>
            <h1>Mini Task Tracker</h1>
            <p className="subtitle">Every task, one honest status.</p>
          </div>
          {!loading && tasks.length > 0 && (
            <ProgressRing
              done={tasks.filter((t) => t.status === "Done").length}
              total={tasks.length}
            />
          )}
        </div>
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
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect
              x="6"
              y="4"
              width="28"
              height="32"
              rx="3"
              stroke="var(--muted)"
              strokeWidth="1.6"
            />
            <path
              d="M13 14h14M13 20h14M13 26h9"
              stroke="var(--muted)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <p>Nothing tracked yet. Add your first task above.</p>
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-card" data-status={task.status}>
              {task.status === "Done" && <span className="stamp">Done</span>}
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
