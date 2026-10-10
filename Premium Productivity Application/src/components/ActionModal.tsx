import React, { useState } from "react";
import { Plus, Clock3, BookOpen, X } from "lucide-react";

interface ActionModalProps {
  type: "task" | "time" | "note" | null;
  onClose: () => void;
  onSubmitTask: (title: string, priority: "P1" | "P2" | "P3", category: string) => Promise<void>;
  onSubmitTime: (activity: string, category: string, durationMin: number) => Promise<void>;
  onSubmitNote: (title: string, content: string) => Promise<void>;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  type,
  onClose,
  onSubmitTask,
  onSubmitTime,
  onSubmitNote,
}) => {
  if (!type) return null;

  // Task form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<"P1" | "P2" | "P3">("P2");
  const [taskCategory, setTaskCategory] = useState("Engineering");

  // Time form
  const [activityName, setActivityName] = useState("");
  const [activityCategory, setActivityCategory] = useState("Engineering");
  const [durationMin, setDurationMin] = useState(30);

  // Note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (type === "task") {
        if (!taskTitle.trim()) return;
        await onSubmitTask(taskTitle.trim(), taskPriority, taskCategory);
      } else if (type === "time") {
        if (!activityName.trim()) return;
        await onSubmitTime(activityName.trim(), activityCategory, durationMin);
      } else if (type === "note") {
        if (!noteTitle.trim() && !noteContent.trim()) return;
        await onSubmitNote(noteTitle.trim() || "Journal Note", noteContent.trim());
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          borderRadius: "24px",
          background: "linear-gradient(145deg, #1c2339, #101627)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
          padding: "24px",
          color: "#f8fafc",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
            {type === "task" && "Create New Task"}
            {type === "time" && "Log Focused Activity Block"}
            {type === "note" && "Write Daily Journal Note"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
          {type === "task" && (
            <>
              <input
                type="text"
                placeholder="What needs to be accomplished?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
                required
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#cbd5e1",
                    fontSize: "11px",
                  }}
                >
                  <option value="P1">P1 (High Priority)</option>
                  <option value="P2">P2 (Normal)</option>
                  <option value="P3">P3 (Low)</option>
                </select>

                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#cbd5e1",
                    fontSize: "11px",
                  }}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Health">Health</option>
                  <option value="Brain">Brain</option>
                  <option value="Communication">Communication</option>
                  <option value="General">General</option>
                </select>
              </div>
            </>
          )}

          {type === "time" && (
            <>
              <input
                type="text"
                placeholder="Activity description (e.g. Distributed Consensus Research)..."
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
                required
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <select
                  value={activityCategory}
                  onChange={(e) => setActivityCategory(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#cbd5e1",
                    fontSize: "11px",
                  }}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Health">Health</option>
                  <option value="Brain">Brain</option>
                  <option value="Communication">Communication</option>
                  <option value="Learning">Learning</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="number"
                  placeholder="Minutes"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#cbd5e1",
                    fontSize: "11px",
                  }}
                />
              </div>
            </>
          )}

          {type === "note" && (
            <>
              <input
                type="text"
                placeholder="Note Header / Title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
              />
              <textarea
                placeholder="What happened today? Accomplishments, learnings, reflections..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontSize: "11px",
                  resize: "vertical",
                }}
                required
              />
            </>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                background: "transparent",
                color: "#94a3b8",
                border: "none",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #7855d7, #5b42c5)",
                color: "#ffffff",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "11px",
                boxShadow: "0 4px 12px rgba(120, 85, 215, 0.35)",
              }}
            >
              {submitting ? "Saving..." : "Confirm & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
