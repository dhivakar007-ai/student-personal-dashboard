import React, { useState, useEffect } from "react";
import { Plus, CheckCircle2, Circle, Trash2, Clock, AlertCircle, ChevronDown } from "lucide-react";
import { tasksApi } from "../lib/godhqApi";
import type { Task } from "../types";
import { useDate } from "../context/DateContext";
import { motion } from "framer-motion";

type FilterView = "All" | "Inbox" | "Today" | "Upcoming" | "Completed" | "Overdue";

const CATEGORIES = ["Engineering", "Learning", "DSA", "Communication", "Health", "Discipline", "Personal", "Project"];
const PRIORITY_COLORS: Record<string, string> = { P1: "#f87171", P2: "#fbbf24", P3: "#60e7dc" };

export const TasksView: React.FC = () => {
  const { selectedDate } = useDate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterView, setFilterView] = useState<FilterView>("Today");

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"P1" | "P2" | "P3">("P2");
  const [newCategory, setNewCategory] = useState("Engineering");
  const [newDate, setNewDate] = useState(selectedDate);
  const [newStatus, setNewStatus] = useState<string>("Planned");

  const today = selectedDate;

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksApi.list();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadTasks(); }, [selectedDate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await tasksApi.create({ title: newTitle.trim(), date: newDate, priority: newPriority, category: newCategory, status: newStatus });
      setTasks((prev) => [created, ...prev]);
      setNewTitle("");
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const handleToggle = async (task: Task) => {
    const nextStatus = task.status === "Completed" ? "Planned" : "Completed";
    try {
      const updated = await tasksApi.update(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const filteredTasks = tasks
    .filter((t) => {
      switch (filterView) {
        case "Inbox": return t.status === "Inbox" || (t.status === "Planned" && !t.date);
        case "Today": return t.date === today;
        case "Upcoming": return t.date && t.date > today && t.status !== "Completed" && t.status !== "Cancelled";
        case "Completed": return t.status === "Completed";
        case "Overdue": return t.date && t.date < today && t.status !== "Completed" && t.status !== "Cancelled";
        default: return true;
      }
    })
    .sort((a, b) => {
      const po = { P1: 0, P2: 1, P3: 2 };
      return (po[a.priority as keyof typeof po] ?? 1) - (po[b.priority as keyof typeof po] ?? 1);
    });

  const counts: Record<FilterView, number> = {
    All: tasks.length,
    Inbox: tasks.filter((t) => t.status === "Inbox" || (t.status === "Planned" && !t.date)).length,
    Today: tasks.filter((t) => t.date === today).length,
    Upcoming: tasks.filter((t) => t.date && t.date > today && t.status !== "Completed" && t.status !== "Cancelled").length,
    Completed: tasks.filter((t) => t.status === "Completed").length,
    Overdue: tasks.filter((t) => t.date && t.date < today && t.status !== "Completed" && t.status !== "Cancelled").length,
  };

  const VIEWS: FilterView[] = ["Today", "Inbox", "Upcoming", "Overdue", "Completed", "All"];

  const emptyMessages: Record<FilterView, { icon: React.ReactNode; title: string; sub: string }> = {
    Inbox: { icon: <Circle size={22} />, title: "Inbox is clear", sub: "No unscheduled tasks pending." },
    Today: { icon: <CheckCircle2 size={22} />, title: "No tasks for today", sub: `No tasks assigned to ${today}. Add one below.` },
    Upcoming: { icon: <Clock size={22} />, title: "Nothing upcoming", sub: "No scheduled future tasks." },
    Completed: { icon: <CheckCircle2 size={22} />, title: "No completed tasks yet", sub: "Complete tasks to see them here." },
    Overdue: { icon: <AlertCircle size={22} />, title: "No overdue tasks", sub: "You're on track. Well done." },
    All: { icon: <Circle size={22} />, title: "No tasks yet", sub: "Create your first task using the button above." },
  };

  return (
    <motion.div className="product-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="product-heading">
        <div className="product-title-icon"><CheckCircle2 size={19} /></div>
        <div>
          <span>TASK MANAGEMENT</span>
          <strong>Tasks</strong>
          <small>Capture, organize, and execute tasks across all categories. Connected to real SQLite database.</small>
        </div>
        <span className="connection-state state-live">LIVE — {tasks.length} TASKS</span>
      </div>

      {/* View tabs */}
      <div className="product-tabs" style={{ gap: "4px" }}>
        {VIEWS.map((v) => (
          <button
            key={v}
            className={v === filterView ? "product-tab-active" : ""}
            onClick={() => setFilterView(v)}
            style={{ position: "relative" }}
          >
            {v}
            {counts[v] > 0 && (
              <span style={{ marginLeft: "5px", fontSize: "9px", background: v === "Overdue" ? "#f87171" : "rgba(255,255,255,0.12)", borderRadius: "99px", padding: "1px 5px", color: v === "Overdue" ? "#fff" : "#94a3b8" }}>
                {counts[v]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Metrics */}
      <div className="page-metric-row">
        <div className="page-metric metric-0"><span>TOTAL</span><strong>{tasks.length}</strong><small>ALL TASKS</small></div>
        <div className="page-metric metric-1"><span>COMPLETED</span><strong>{counts.Completed}</strong><small>DONE</small></div>
        <div className="page-metric metric-2"><span>OVERDUE</span><strong>{counts.Overdue}</strong><small>{counts.Overdue > 0 ? "NEEDS ATTENTION" : "CLEAR"}</small></div>
        <div className="page-metric metric-0"><span>TODAY</span><strong>{counts.Today}</strong><small>SCHEDULED</small></div>
      </div>

      {/* Add Task */}
      <div style={{ marginBottom: "12px" }}>
        {!isAdding ? (
          <button
            onClick={() => { setIsAdding(true); setNewDate(today); }}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)", color: "#94a3b8", cursor: "pointer", fontSize: "11px", width: "100%" }}
          >
            <Plus size={14} /> Add task...
          </button>
        ) : (
          <form onSubmit={handleCreate} style={{ padding: "14px", background: "rgba(255,255,255,0.04)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", display: "grid", gap: "10px" }}>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Task title..."
              style={{ padding: "8px 12px", borderRadius: "8px", background: "#111625", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "12px" }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as "P1"|"P2"|"P3")} style={{ padding: "7px", borderRadius: "8px", background: "#111625", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "11px" }}>
                <option value="P1">P1 — Critical</option>
                <option value="P2">P2 — Normal</option>
                <option value="P3">P3 — Low</option>
              </select>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ padding: "7px", borderRadius: "8px", background: "#111625", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "11px" }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ padding: "7px", borderRadius: "8px", background: "#111625", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "11px" }}>
                <option value="Inbox">Inbox</option>
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
              </select>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ padding: "7px", borderRadius: "8px", background: "#111625", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "11px" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" style={{ padding: "8px 18px", borderRadius: "8px", background: "#60e7dc22", border: "1px solid #60e7dc66", color: "#60e7dc", cursor: "pointer", fontSize: "11px", fontWeight: 600 }}>Create Task</button>
              <button type="button" onClick={() => setIsAdding(false)} style={{ padding: "8px 14px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b", cursor: "pointer", fontSize: "11px" }}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {error && <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "10px", color: "#f87171", fontSize: "11px", marginBottom: "12px" }}>{error}</div>}

      {/* Task List */}
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b", fontSize: "12px" }}>Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="page-empty" style={{ minHeight: "160px" }}>
          {emptyMessages[filterView].icon}
          <strong>{emptyMessages[filterView].title}</strong>
          <span>{emptyMessages[filterView].sub}</span>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "6px" }}>
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ padding: "11px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "10px" }}
            >
              <button onClick={() => handleToggle(task)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, color: task.status === "Completed" ? "#60e7dc" : "#475569" }}>
                {task.status === "Completed" ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </button>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: PRIORITY_COLORS[task.priority] || "#64748b", flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: "12px", color: task.status === "Completed" ? "#475569" : "#e2e8f0", textDecoration: task.status === "Completed" ? "line-through" : "none" }}>
                {task.title}
              </span>
              <span style={{ fontSize: "9px", color: "#475569", flexShrink: 0 }}>{task.category}</span>
              {task.date && <span style={{ fontSize: "9px", color: task.date < today && task.status !== "Completed" ? "#f87171" : "#475569", flexShrink: 0 }}>{task.date}</span>}
              <button onClick={() => handleDelete(task.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#334155", flexShrink: 0 }}>
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
