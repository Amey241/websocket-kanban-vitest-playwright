import { io } from "socket.io-client";
import { useEffect, useState, useMemo } from "react";

const socket = io("http://localhost:5000", {
  autoConnect: true,
  reconnection: true,
});

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Feature");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on("sync:tasks", (data) => {
      setTasks(data);
      setLoading(false);
    });

    socket.on("task:create", (task) => {
      setTasks((prev) => [...prev, task]);
    });

    socket.on("task:update", (task) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? task : t))
      );
    });

    socket.on("task:delete", (id) => {
      setTasks((prev) => prev.filter((t) => t._id !== id));
    });

    socket.on("disconnect", () => setLoading(true));

    return () => socket.off();
  }, []);

  const createTask = () => {
    if (!title.trim()) return;

    socket.emit("task:create", {
      title,
      column: "Todo",
      priority,
      category,
    });

    setTitle("");
  };

  const moveTask = (task, column) => {
    socket.emit("task:update", { ...task, column });
  };

  const deleteTask = (id) => {
    socket.emit("task:delete", id);
  };

  const columns = ["Todo", "In Progress", "Done"];

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.column === "Done").length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        🔄 Syncing tasks...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>Smart Kanban Board</h1>

      {/* Progress */}
      <div style={styles.progressContainer}>
        <div style={styles.progressHeader}>
          <span>Project Progress</span>
          <span>{progress}%</span>
        </div>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Form */}
      <div style={styles.formBox}>
        <input
          style={styles.input}
          placeholder="Enter new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          style={styles.select}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <select
          style={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Feature</option>
          <option>Bug</option>
          <option>Improvement</option>
        </select>

        <button style={styles.addButton} onClick={createTask}>
          Add Task
        </button>
      </div>

      {/* Board */}
      <div style={styles.board}>
        {columns.map((col) => (
          <div key={col} style={styles.column}>
            <h2 style={styles.columnTitle}>{col}</h2>

            {tasks
              .filter((t) => t.column === col)
              .map((task) => (
                <div key={task._id} style={styles.card}>
                  <h4>{task.title}</h4>

                  <div style={styles.badgeRow}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor:
                          task.priority === "High"
                            ? "#ffdddd"
                            : task.priority === "Medium"
                            ? "#fff4cc"
                            : "#ddffdd",
                        color:
                          task.priority === "High"
                            ? "#d8000c"
                            : task.priority === "Medium"
                            ? "#9f6000"
                            : "#4f8a10",
                      }}
                    >
                      {task.priority}
                    </span>

                    <span style={styles.category}>
                      {task.category}
                    </span>
                  </div>

                  <div style={styles.buttonRow}>
                    <button
                      style={styles.deleteButton}
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </button>

                    {columns
                      .filter((c) => c !== col)
                      .map((c) => (
                        <button
                          key={c}
                          style={styles.moveButton}
                          onClick={() => moveTask(task, c)}
                        >
                          Move to {c}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================== STYLES ================== */

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
    padding: "40px",
    backgroundColor: "#f4f6f9",
    minHeight: "100vh",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  loadingScreen: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    fontWeight: "bold",
    backgroundColor: "#f4f6f9",
  },

  progressContainer: {
    maxWidth: "600px",
    margin: "0 auto 30px auto",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
  },

  progressBar: {
    height: "10px",
    backgroundColor: "#ddd",
    borderRadius: "10px",
  },

  progressFill: {
    height: "10px",
    backgroundColor: "#4caf50",
    borderRadius: "10px",
    transition: "width 0.3s ease",
  },

  formBox: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  input: {
    padding: "10px",
    width: "250px",
  },

  select: {
    padding: "10px",
  },

  addButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  board: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
  },

  column: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "10px",
    width: "300px",
    minHeight: "400px",
  },

  columnTitle: {
    textAlign: "center",
    marginBottom: "15px",
  },

  card: {
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
  },

  badgeRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  badge: {
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
  },

  category: {
    fontSize: "12px",
    color: "#555",
  },

  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
  },

  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },

  moveButton: {
    backgroundColor: "#ddd",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
