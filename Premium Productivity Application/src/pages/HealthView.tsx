import React, { useState } from "react";
import { Moon, Droplets, Footprints, Dumbbell, Sun, HeartPulse, Check, Sparkles } from "lucide-react";
import { useDate } from "../context/DateContext";

export const HealthView: React.FC = () => {
  const { selectedDate, dailyRecord, updateChecklist, updateMeasurements } = useDate();

  const healthHabits = [
    { key: "wake_up_target", label: "Wake up target (05:00)" },
    { key: "sleep_target", label: "Sleep target (8 hours)" },
    { key: "water_target", label: "Hydration target (4L)" },
    { key: "walk_done", label: "Daily walking (30 min)" },
    { key: "workout_done", label: "Physical workout session" },
    { key: "sunlight_done", label: "Outdoor morning sunlight" },
    { key: "brush_am", label: "Morning dental hygiene" },
    { key: "brush_pm", label: "Evening dental hygiene" },
    { key: "bath_done", label: "Cold / fresh restorative bath" },
    { key: "meals_tracked", label: "Nutrition & meals logged" },
  ];

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Vitals Summary Card */}
      <div
        style={{
          borderRadius: "24px",
          padding: "24px",
          background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 14px 34px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <HeartPulse size={18} color="#34d399" />
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Health & Vitality</h2>
            </div>
            <p style={{ fontSize: "10px", color: "#8a96ad", margin: "4px 0 0" }}>
              Physical baseline metrics, recovery, hydration, and movement for {selectedDate}
            </p>
          </div>
          <div
            style={{
              padding: "4px 12px",
              borderRadius: "99px",
              background: "rgba(52, 211, 153, 0.15)",
              color: "#34d399",
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            Health Score: {dailyRecord?.health_score ? dailyRecord.health_score.toFixed(0) : 0}%
          </div>
        </div>

        {/* Primary vitals row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px" }}>
          <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#a78bfa", fontSize: "11px", fontWeight: 600 }}>
              <Moon size={14} /> Sleep
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#f1f5f9", marginTop: "6px" }}>
              {dailyRecord?.sleep_hours?.toFixed(1) ?? "0.0"} <span style={{ fontSize: "10px", color: "#64748b" }}>/ 8.0h</span>
            </div>
          </div>

          <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#65e5ff", fontSize: "11px", fontWeight: 600 }}>
              <Droplets size={14} /> Water
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#f1f5f9", marginTop: "6px" }}>
              {dailyRecord?.water_l?.toFixed(1) ?? "0.0"} <span style={{ fontSize: "10px", color: "#64748b" }}>/ 4.0L</span>
            </div>
          </div>

          <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34d399", fontSize: "11px", fontWeight: 600 }}>
              <Footprints size={14} /> Walking
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#f1f5f9", marginTop: "6px" }}>
              {dailyRecord?.walking_min ?? 0} <span style={{ fontSize: "10px", color: "#64748b" }}>/ 30 min</span>
            </div>
          </div>

          <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fb923c", fontSize: "11px", fontWeight: 600 }}>
              <Dumbbell size={14} /> Workout
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#f1f5f9", marginTop: "6px" }}>
              {dailyRecord?.workout_sessions ?? 0} <span style={{ fontSize: "10px", color: "#64748b" }}>/ 1 session</span>
            </div>
          </div>
        </div>
      </div>

      {/* Health Protocols Checklist */}
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
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Physical Habits Checklist</h2>
          <p style={{ fontSize: "10px", color: "#8a96ad", margin: "3px 0 0" }}>Daily hygiene, recovery, and wellness routines</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px" }}>
          {healthHabits.map((item) => {
            const isChecked = Boolean(dailyRecord && (dailyRecord as any)[item.key]);
            return (
              <button
                key={item.key}
                onClick={() => void updateChecklist({ [item.key]: !isChecked })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  background: isChecked ? "rgba(52, 211, 153, 0.06)" : "rgba(255, 255, 255, 0.02)",
                  border: isChecked ? "1px solid rgba(52, 211, 153, 0.25)" : "1px solid rgba(255, 255, 255, 0.05)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "4px",
                    border: isChecked ? "1.5px solid #34d399" : "1.5px solid rgba(255, 255, 255, 0.2)",
                    background: isChecked ? "rgba(52, 211, 153, 0.2)" : "transparent",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {isChecked && <Check size={11} color="#34d399" strokeWidth={3} />}
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: isChecked ? "#64748b" : "#cbd5e1",
                    textDecoration: isChecked ? "line-through" : "none",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
