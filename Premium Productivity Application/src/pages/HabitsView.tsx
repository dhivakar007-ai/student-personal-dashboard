import React, { useState, useEffect } from "react";
import { Flame, CheckCircle2, Trophy, Sparkles } from "lucide-react";
import { analyticsApi, dailyApi } from "../lib/godhqApi";
import type { StreaksData, WeeklyAnalytics, DailyRecord } from "../types";
import { useDate } from "../context/DateContext";

export const HabitsView: React.FC = () => {
  const { selectedDate, refreshDailyRecord } = useDate();
  const [streaks, setStreaks] = useState<StreaksData | null>(null);
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHabitData = async () => {
    try {
      setLoading(true);
      const [sData, wData] = await Promise.all([
        analyticsApi.getStreaks(selectedDate),
        analyticsApi.getWeekly(selectedDate),
      ]);
      setStreaks(sData);
      setWeekly(wData);
    } catch (err) {
      console.error("Failed to load habit streaks/matrix:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHabitData();
  }, [selectedDate]);

  const streakCards = [
    { label: "Overall Streak", current: streaks?.overall_streak ?? 0, best: streaks?.best_overall_streak ?? 0, accent: "#fb923c" },
    { label: "Coding Streak", current: streaks?.coding_streak ?? 0, best: streaks?.best_coding_streak ?? 0, accent: "#65e5ff" },
    { label: "DSA Streak", current: streaks?.dsa_streak ?? 0, best: streaks?.best_dsa_streak ?? 0, accent: "#c46dff" },
    { label: "Reading Streak", current: streaks?.reading_streak ?? 0, best: streaks?.best_reading_streak ?? 0, accent: "#fbbf24" },
    { label: "Workout Streak", current: streaks?.workout_streak ?? 0, best: streaks?.best_workout_streak ?? 0, accent: "#34d399" },
    { label: "Meditation Streak", current: streaks?.meditation_streak ?? 0, best: streaks?.best_meditation_streak ?? 0, accent: "#f472b6" },
  ];

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Streaks Header Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
        {streakCards.map((sc) => (
          <div
            key={sc.label}
            style={{
              padding: "16px",
              borderRadius: "20px",
              background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "10px", color: "#8a96ad", fontWeight: 600 }}>{sc.label}</span>
              <Flame size={14} color={sc.accent} />
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span style={{ fontSize: "24px", fontWeight: 700, fontFamily: "monospace", color: sc.accent }}>
                {sc.current}
              </span>
              <span style={{ fontSize: "10px", color: "#64748b" }}>days</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "9px", color: "#64748b", marginTop: "2px" }}>
              <Trophy size={10} color="#fbbf24" />
              <span>Best: {sc.best} days</span>
            </div>
          </div>
        ))}
      </div>

      {/* 7-Day Habit Matrix */}
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
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Weekly Habit Consistency Matrix</h2>
            <p style={{ fontSize: "10px", color: "#8a96ad", margin: "3px 0 0" }}>7-day rolling window habit completion records</p>
          </div>
          <span style={{ fontSize: "10px", color: "#65e5ff", fontFamily: "monospace" }}>
            {weekly?.week_start || ""} – {weekly?.week_end || ""}
          </span>
        </div>

        {(!weekly?.matrix || weekly.matrix.length === 0) ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: "12px", color: "#cbd5e1" }}>No habit records yet for this rolling period.</p>
            <p style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>Complete your habits on the Today screen to build your consistency matrix.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontWeight: 600 }}>Habit</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", color: "#94a3b8", fontWeight: 600 }}>Category</th>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <th key={d} style={{ textAlign: "center", padding: "8px 8px", color: "#94a3b8", fontWeight: 600 }}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekly.matrix.map((row, idx) => (
                  <tr
                    key={row.habit}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                      background: idx % 2 === 0 ? "rgba(255, 255, 255, 0.01)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "8px 12px", color: "#f1f5f9", fontWeight: 500 }}>{row.habit}</td>
                    <td style={{ padding: "8px 12px", color: "#64748b", fontSize: "10px" }}>{row.category}</td>
                    {row.days.map((isDone, dayIdx) => (
                      <td key={dayIdx} style={{ textAlign: "center", padding: "8px 8px" }}>
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "4px",
                            margin: "0 auto",
                            background: isDone ? "#34d399" : "rgba(255, 255, 255, 0.05)",
                            boxShadow: isDone ? "0 0 10px rgba(52, 211, 153, 0.4)" : "none",
                            display: "grid",
                            placeItems: "center",
                          }}
                        >
                          {isDone && <CheckCircle2 size={10} color="#0f172a" strokeWidth={3} />}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
