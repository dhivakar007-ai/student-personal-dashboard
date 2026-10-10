import React, { useState, useEffect } from "react";
import { Check, Plus, Minus, Moon, Droplets, Footprints, Code2, Binary, BookOpen, Sparkles, MessageCircle, Calendar } from "lucide-react";
import { useDate } from "../context/DateContext";
import { formatDateDisplay } from "../lib/dateEngine";

export const TodayView: React.FC = () => {
  const { selectedDate, dailyRecord, updateChecklist, updateMeasurements, loading } = useDate();

  const isSaturday = new Date(`${selectedDate}T00:00:00`).getDay() === 6;
  const isSunday = new Date(`${selectedDate}T00:00:00`).getDay() === 0;

  const sections = [
    {
      title: "Health",
      accent: "#34d399",
      items: [
        { key: "wake_up_target", label: "Wake up target" },
        { key: "meals_tracked", label: "Meals tracked" },
        { key: "water_target", label: "Water target" },
        { key: "walk_done", label: "Walking done" },
        { key: "workout_done", label: "Workout done" },
        { key: "sunlight_done", label: "Outdoor / sunlight" },
        { key: "brush_am", label: "Brush AM" },
        { key: "brush_pm", label: "Brush PM" },
        { key: "bath_done", label: "Cold / fresh bath" },
        { key: "sleep_target", label: "Sleep target" },
      ],
    },
    {
      title: "Brain",
      accent: "#a78bfa",
      items: [
        { key: "reading_done", label: "Reading" },
        { key: "brain_workout_done", label: "Brain workout" },
        { key: "meditation_done", label: "Meditation" },
        { key: "writing_done", label: "Writing" },
      ],
    },
    {
      title: "Engineering",
      accent: "#65e5ff",
      items: [
        { key: "coding_done", label: "Coding" },
        { key: "dsa_done", label: "DSA" },
        { key: "technical_learning_done", label: "Technical learning" },
        { key: "project_done", label: "Project work" },
      ],
    },
    {
      title: "Communication",
      accent: "#fbbf24",
      items: [
        { key: "communication_done", label: "Communication" },
        { key: "jam_done", label: "JAM drill" },
        { key: "voice_practice_done", label: "Voice practice" },
      ],
    },
    {
      title: "Discipline",
      accent: "#fb923c",
      items: [
        { key: "avoid_scrolling", label: "Avoid scrolling" },
        { key: "phone_free_sleep", label: "Phone-free bedtime" },
        { key: "mit_completed", label: "MIT completed" },
      ],
    },
  ];

  const metrics = [
    { key: "sleep_hours", name: "Sleep", val: dailyRecord?.sleep_hours ?? 0, target: 8.0, unit: "h", step: 0.5, isFloat: true, icon: Moon, accent: "#a78bfa" },
    { key: "water_l", name: "Water", val: dailyRecord?.water_l ?? 0, target: 4.0, unit: "L", step: 0.25, isFloat: true, icon: Droplets, accent: "#65e5ff" },
    { key: "walking_min", name: "Walking", val: dailyRecord?.walking_min ?? 0, target: 30, unit: "min", step: 5, isFloat: false, icon: Footprints, accent: "#34d399" },
    { key: "coding_min", name: "Coding", val: dailyRecord?.coding_min ?? 0, target: 60, unit: "min", step: 15, isFloat: false, icon: Code2, accent: "#65e5ff" },
    { key: "dsa_problems", name: "DSA", val: dailyRecord?.dsa_problems ?? 0, target: 2, unit: "problems", step: 1, isFloat: false, icon: Binary, accent: "#c46dff" },
    { key: "reading_min", name: "Reading", val: dailyRecord?.reading_min ?? 0, target: 20, unit: "min", step: 5, isFloat: false, icon: BookOpen, accent: "#fbbf24" },
    { key: "meditation_min", name: "Meditation", val: dailyRecord?.meditation_min ?? 0, target: 5, unit: "min", step: 1, isFloat: false, icon: Sparkles, accent: "#f472b6" },
    { key: "communication_min", name: "Communication", val: dailyRecord?.communication_min ?? 0, target: 15, unit: "min", step: 5, isFloat: false, icon: MessageCircle, accent: "#fb923c" },
  ];

  const handleAdjustMetric = (key: string, current: number, delta: number, isFloat: boolean) => {
    const newVal = Math.max(0, isFloat ? Math.round((current + delta) * 10) / 10 : current + delta);
    void updateMeasurements({ [key]: newVal });
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Weekend routine focus banner if applicable */}
      {isSaturday && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(101, 229, 255, 0.12), rgba(126, 140, 255, 0.08))",
            border: "1px solid rgba(101, 229, 255, 0.25)",
            fontSize: "12px",
            color: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "6px",
              background: "rgba(101, 229, 255, 0.2)",
              color: "#65e5ff",
              fontWeight: 700,
              fontSize: "10px",
            }}
          >
            SATURDAY FOCUS
          </span>
          <span>Cybersecurity Deep-Dive, Advanced DSA, System Architecture Research, and Coding.</span>
        </div>
      )}
      {isSunday && (
        <div
          style={{
            padding: "12px 18px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(167, 139, 250, 0.12), rgba(244, 114, 182, 0.08))",
            border: "1px solid rgba(167, 139, 250, 0.25)",
            fontSize: "12px",
            color: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "6px",
              background: "rgba(167, 139, 250, 0.2)",
              color: "#a78bfa",
              fontWeight: 700,
              fontSize: "10px",
            }}
          >
            SUNDAY FOCUS
          </span>
          <span>Self-Learning Course, Weekly Retrospective, Strategic Planning, Reading, and Creative Work.</span>
        </div>
      )}

      {/* Measurable Targets Grid */}
      <div
        style={{
          borderRadius: "24px",
          padding: "20px",
          background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 14px 34px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Daily Measurable Targets</h2>
            <p style={{ fontSize: "10px", color: "#8a96ad", margin: "3px 0 0" }}>Real-time updates synced with today's record</p>
          </div>
          <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#7de9f2" }}>{selectedDate}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
          {metrics.map((m) => {
            const pct = Math.min(100, Math.round((m.val / m.target) * 100));
            const isDone = pct >= 100;
            return (
              <div
                key={m.key}
                style={{
                  padding: "12px",
                  borderRadius: "14px",
                  background: isDone ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.02)",
                  border: isDone ? `1px solid ${m.accent}40` : "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: isDone ? m.accent : "#94a3b8" }}>{m.name}</span>
                  <div style={{ display: "flex", gap: "2px" }}>
                    <button
                      onClick={() => handleAdjustMetric(m.key, m.val, -m.step, m.isFloat)}
                      style={{
                        padding: "1px 4px",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                      }}
                    >
                      <Minus size={10} />
                    </button>
                    <button
                      onClick={() => handleAdjustMetric(m.key, m.val, m.step, m.isFloat)}
                      style={{
                        padding: "1px 4px",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: "monospace", color: isDone ? m.accent : "#f1f5f9" }}>
                    {m.isFloat ? m.val.toFixed(1) : m.val}
                  </span>
                  <span style={{ fontSize: "9px", color: "#64748b", marginLeft: "4px" }}>
                    / {m.target} {m.unit}
                  </span>
                </div>

                <div style={{ height: "3px", width: "100%", background: "rgba(255, 255, 255, 0.08)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: m.accent, transition: "width 0.3s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit Checklist Grid */}
      <div
        style={{
          borderRadius: "24px",
          padding: "20px",
          background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 14px 34px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Daily Protocol Checklist (24 Habits)</h2>
          <p style={{ fontSize: "10px", color: "#8a96ad", margin: "3px 0 0" }}>Click each habit to toggle completion state in the database</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
          {sections.map((sec) => {
            const completedCount = sec.items.filter((i) => dailyRecord && (dailyRecord as any)[i.key]).length;
            const allDone = completedCount === sec.items.length;

            return (
              <div
                key={sec.title}
                style={{
                  padding: "14px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: allDone ? `1px solid ${sec.accent}40` : "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", paddingBottom: "6px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: allDone ? sec.accent : "#cbd5e1" }}>{sec.title}</span>
                  <span style={{ fontSize: "9px", fontFamily: "monospace", color: allDone ? sec.accent : "#64748b" }}>
                    {completedCount}/{sec.items.length}
                  </span>
                </div>

                <div style={{ display: "grid", gap: "4px" }}>
                  {sec.items.map((item) => {
                    const isChecked = Boolean(dailyRecord && (dailyRecord as any)[item.key]);
                    return (
                      <button
                        key={item.key}
                        onClick={() => void updateChecklist({ [item.key]: !isChecked })}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "5px 6px",
                          borderRadius: "6px",
                          background: isChecked ? "rgba(255, 255, 255, 0.04)" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "4px",
                            border: isChecked ? `1.5px solid ${sec.accent}` : "1.5px solid rgba(255, 255, 255, 0.2)",
                            background: isChecked ? `${sec.accent}30` : "transparent",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          {isChecked && <Check size={10} color={sec.accent} strokeWidth={3} />}
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            color: isChecked ? "#64748b" : "#cbd5e1",
                            textDecoration: isChecked ? "line-through" : "none",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
