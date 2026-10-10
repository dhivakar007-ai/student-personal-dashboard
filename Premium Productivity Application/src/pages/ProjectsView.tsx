import React, { useState, useEffect } from "react";
import { Plus, BriefcaseBusiness, Trash2, ExternalLink } from "lucide-react";
import { growthApi } from "../lib/godhqApi";
import type { Project } from "../types";

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technology, setTechnology] = useState("");
  const [status, setStatus] = useState("Active");
  const [deadline, setDeadline] = useState("");

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await growthApi.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const created = await growthApi.createProject({
        title: title.trim(),
        description,
        technology,
        status,
        deadline,
        progress: 0,
      });
      setProjects((prev) => [created, ...prev]);
      setTitle("");
      setDescription("");
      setTechnology("");
      setDeadline("");
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  const handleUpdateProgress = async (id: number, progress: number) => {
    try {
      const updatedStatus = progress >= 100 ? "Completed" : "Active";
      const updated = await growthApi.updateProject(id, { progress, status: updatedStatus });
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project progress");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await growthApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
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
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Engineering Projects</h2>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "6px",
                background: "rgba(101, 229, 255, 0.15)",
                color: "#65e5ff",
                fontSize: "10px",
                fontWeight: 600,
              }}
            >
              {projects.length} Repositories / Builds
            </span>
          </div>
          <p style={{ fontSize: "10px", color: "#8a96ad", margin: "4px 0 0" }}>
            Production systems, full-stack applications, and architectural research
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
          <span>New Project</span>
        </button>
      </div>

      {/* Add Project Form */}
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
            placeholder="Project Title (e.g. Distributed Task Orchestrator in Go)..."
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input
              type="text"
              placeholder="Technology Stack (e.g. Go, gRPC, Redis, Docker)..."
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#cbd5e1",
                fontSize: "11px",
              }}
            />

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
            placeholder="Project description and primary architectural milestones..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
                background: "#65e5ff",
                color: "#0f172a",
                fontWeight: 600,
                fontSize: "11px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Save Project
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
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
            <BriefcaseBusiness size={22} />
          </div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1", margin: 0 }}>No engineering projects yet</p>
          <p style={{ fontSize: "10px", color: "#64748b", margin: "4px 0 16px" }}>
            Track your systems, applications, and technical builds in one place.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            style={{
              padding: "6px 14px",
              borderRadius: "10px",
              background: "rgba(101, 229, 255, 0.15)",
              color: "#65e5ff",
              fontSize: "11px",
              fontWeight: 600,
              border: "1px solid rgba(101, 229, 255, 0.3)",
              cursor: "pointer",
            }}
          >
            + Create First Project
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {projects.map((p) => {
            const isCompleted = p.progress >= 100 || p.status === "Completed";
            return (
              <div
                key={p.id}
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
                      {p.technology && (
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            color: "#65e5ff",
                            textTransform: "uppercase",
                          }}
                        >
                          {p.technology}
                        </span>
                      )}
                      <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", margin: "4px 0 0" }}>{p.title}</h3>
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
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

                  {p.description && (
                    <p style={{ fontSize: "10px", color: "#94a3b8", margin: "8px 0 0", lineHeight: 1.4 }}>
                      {p.description}
                    </p>
                  )}
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "10px", color: "#8a96ad" }}>Completion</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, fontFamily: "monospace", color: isCompleted ? "#34d399" : "#65e5ff" }}>
                      {p.progress}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={p.progress}
                    onChange={(e) => handleUpdateProgress(p.id, Number(e.target.value))}
                    style={{ width: "100%", accentColor: isCompleted ? "#34d399" : "#65e5ff", cursor: "pointer" }}
                  />

                  {p.deadline && (
                    <div style={{ fontSize: "9px", color: "#64748b", marginTop: "6px" }}>
                      Target: <span style={{ fontFamily: "monospace", color: "#94a3b8" }}>{p.deadline}</span>
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
