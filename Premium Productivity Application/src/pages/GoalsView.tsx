import React, { useState, useEffect } from "react";
import { Plus, Target, Trash2, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { growthApi } from "../lib/godhqApi";
import type { Goal } from "../types";

export const GoalsView: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("Engineering");
  const [type, setType] = useState("Monthly");
  const [deadline, setDeadline] = useState("");
  const [why, setWhy] = useState("");

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await growthApi.getGoals();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const created = await growthApi.createGoal({
        title: title.trim(),
        area,
        type,
        deadline,
        why,
        progress: 0,
        status: "Active",
      });
      setGoals((prev) => [created, ...prev]);
      setTitle("");
      setWhy("");
      setDeadline("");
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal");
    }
  };

  const handleUpdateProgress = async (id: number, progress: number) => {
    try {
      const status = progress >= 100 ? "Completed" : "Active";
      const updated = await growthApi.updateGoal(id, { progress, status });
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update goal progress");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await growthApi.deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete goal");
    }
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Header */}
      <div
        style={{
          borderRadius: "24px",
          padding: "20px",
          background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 14px 34px rgba(0, 0, 0, 0.35)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Strategic Goals</h2>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "6px",
                background: "rgba(167, 139, 250, 0.15)",
                color: "#a78bfa",
                fontSize: "10px",
                fontWeight: 600,
              }}
            >
              {goals.length} Active Targets
            </span>
          </div>
          <p style={{ fontSize: "10px", color: "#8a96ad", margin: "4px 0 0" }}>
            High-leverage milestones across Engineering, Health, and Personal growth
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #7855d7, #5b42c5)",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 600,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 12px rgba(120, 85, 215, 0.35)",
            cursor: "pointer",
          }}
        >
          <Plus size={14} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Add Goal Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          style={{
            padding: "16px",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            display: "grid",
            gap: "12px",
          }}
        >
          <input
            type="text"
            placeholder="Goal Title (e.g. Master System Design & Microservices)..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#f8fafc",
              fontSize: "12px",
            }}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#cbd5e1",
                fontSize: "11px",
              }}
            >
              <option value="Engineering">Engineering</option>
              <option value="Health">Health</option>
              <option value="Brain">Brain</option>
              <option value="Career">Career</option>
              <option value="Finance">Finance</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#cbd5e1",
                fontSize: "11px",
              }}
            >
              <option value="Weekly">Weekly Sprint</option>
              <option value="Monthly">Monthly Focus</option>
              <option value="Quarterly">Quarterly OKR</option>
              <option value="Yearly">Yearly Goal</option>
            </select>

            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#cbd5e1",
                fontSize: "11px",
              }}
            />
          </div>

          <textarea
            placeholder="Why is this goal critical? What is your core motivation?"
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            rows={2}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#f8fafc",
              fontSize: "11px",
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                background: "transparent",
                color: "#94a3b8",
                fontSize: "11px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                background: "#a78bfa",
                color: "#0f172a",
                fontWeight: 600,
                fontSize: "11px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div
          style={{
            borderRadius: "24px",
            padding: "40px 20px",
            background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.04)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 12px",
              color: "#64748b",
            }}
          >
            <Target size={22} />
          </div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1", margin: 0 }}>No strategic goals yet</p>
          <p style={{ fontSize: "10px", color: "#64748b", margin: "4px 0 16px" }}>
            Define clear goals with quantifiable deadlines to anchor your daily habits.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            style={{
              padding: "6px 14px",
              borderRadius: "10px",
              background: "rgba(167, 139, 250, 0.15)",
              color: "#a78bfa",
              fontSize: "11px",
              fontWeight: 600,
              border: "1px solid rgba(167, 139, 250, 0.3)",
              cursor: "pointer",
            }}
          >
            + Create First Goal
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {goals.map((g) => {
            const isCompleted = g.progress >= 100 || g.status === "Completed";
            return (
              <div
                key={g.id}
                style={{
                  borderRadius: "20px",
                  padding: "16px",
                  background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))",
                  border: isCompleted ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 10px 24px rgba(0, 0, 0, 0.3)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          color: "#65e5ff",
                          textTransform: "uppercase",
                        }}
                      >
                        {g.area} • {g.type}
                      </span>
                      <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", margin: "4px 0 0" }}>{g.title}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(g.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ff7180")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {g.why && (
                    <p style={{ fontSize: "10px", color: "#94a3b8", fontStyle: "italic", margin: "8px 0 0", lineHeight: 1.4 }}>
                      "{g.why}"
                    </p>
                  )}
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "10px", color: "#8a96ad" }}>Progress</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, fontFamily: "monospace", color: isCompleted ? "#34d399" : "#a78bfa" }}>
                      {g.progress}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={g.progress}
                    onChange={(e) => handleUpdateProgress(g.id, Number(e.target.value))}
                    style={{ width: "100%", accentColor: isCompleted ? "#34d399" : "#a78bfa", cursor: "pointer" }}
                  />

                  {g.deadline && (
                    <div style={{ fontSize: "9px", color: "#64748b", marginTop: "6px" }}>
                      Target: <span style={{ fontFamily: "monospace", color: "#94a3b8" }}>{g.deadline}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
