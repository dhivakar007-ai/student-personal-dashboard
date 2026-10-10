import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Calendar, Clock, Activity } from "lucide-react";
import { analyticsApi } from "../lib/godhqApi";
import type { WeeklyAnalytics, MonthlyAnalytics, YearlyAnalytics } from "../types";
import { useDate } from "../context/DateContext";

export const AnalyticsView: React.FC = () => {
  const { selectedDate, setSelectedDate } = useDate();
  const [timeframe, setTimeframe] = useState<"Weekly" | "Monthly" | "Yearly">("Weekly");
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [monthly, setMonthly] = useState<MonthlyAnalytics | null>(null);
  const [yearly, setYearly] = useState<YearlyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const currentYear = Number(selectedDate.slice(0, 4)) || new Date().getFullYear();
      const [w, m, y] = await Promise.all([
        analyticsApi.getWeekly(selectedDate),
        analyticsApi.getMonthly(selectedDate),
        analyticsApi.getYearly(currentYear),
      ]);
      setWeekly(w);
      setMonthly(m);
      setYearly(y);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, [selectedDate]);

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Header bar */}
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
            <BarChart3 size={18} color="#65e5ff" />
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Performance Analytics</h2>
          </div>
          <p style={{ fontSize: "10px", color: "#8a96ad", margin: "4px 0 0" }}>
            Aggregated trends computed from permanent time-series database records
          </p>
        </div>

        <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.04)", borderRadius: "10px", padding: "3px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          {(["Weekly", "Monthly", "Yearly"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: timeframe === tf ? 700 : 500,
                background: timeframe === tf ? "linear-gradient(135deg, rgba(101, 229, 255, 0.2), rgba(126, 140, 255, 0.2))" : "transparent",
                color: timeframe === tf ? "#65e5ff" : "#94a3b8",
                border: timeframe === tf ? "1px solid rgba(101, 229, 255, 0.3)" : "none",
                cursor: "pointer",
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {timeframe === "Weekly" && (
        <div style={{ display: "grid", gap: "16px" }}>
          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
            <div style={{ padding: "16px", borderRadius: "20px", background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <span style={{ fontSize: "10px", color: "#8a96ad" }}>Weekly Score</span>
              <div style={{ fontSize: "24px", fontWeight: 700, fontFamily: "monospace", color: "#65e5ff", marginTop: "4px" }}>
                {weekly?.weekly_score ? weekly.weekly_score.toFixed(0) : 0}%
              </div>
            </div>
            <div style={{ padding: "16px", borderRadius: "20px", background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <span style={{ fontSize: "10px", color: "#8a96ad" }}>Days Tracked</span>
              <div style={{ fontSize: "24px", fontWeight: 700, fontFamily: "monospace", color: "#34d399", marginTop: "4px" }}>
                {weekly?.days_tracked ?? 0} <span style={{ fontSize: "11px", color: "#64748b" }}>/ 7</span>
              </div>
            </div>
            <div style={{ padding: "16px", borderRadius: "20px", background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <span style={{ fontSize: "10px", color: "#8a96ad" }}>Coding Hours</span>
              <div style={{ fontSize: "24px", fontWeight: 700, fontFamily: "monospace", color: "#a78bfa", marginTop: "4px" }}>
                {weekly?.total_coding_hours ? weekly.total_coding_hours.toFixed(1) : "0.0"}h
              </div>
            </div>
            <div style={{ padding: "16px", borderRadius: "20px", background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <span style={{ fontSize: "10px", color: "#8a96ad" }}>DSA Problems</span>
              <div style={{ fontSize: "24px", fontWeight: 700, fontFamily: "monospace", color: "#fbbf24", marginTop: "4px" }}>
                {weekly?.total_dsa ?? 0}
              </div>
            </div>
          </div>

          {/* 7-Day Bar Chart */}
          <div
            style={{
              borderRadius: "24px",
              padding: "20px",
              background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 14px 34px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Daily Trajectory</h3>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Click any day to jump to date</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", minHeight: "150px", alignItems: "flex-end" }}>
              {(weekly?.daily_scores || []).map((ds) => {
                const score = Math.min(100, Math.max(0, ds.score));
                const isSelected = ds.date === selectedDate;
                return (
                  <div
                    key={ds.date}
                    onClick={() => setSelectedDate(ds.date)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      padding: "8px 4px",
                      borderRadius: "12px",
                      background: isSelected ? "rgba(101, 229, 255, 0.08)" : "transparent",
                      border: isSelected ? "1px solid rgba(101, 229, 255, 0.2)" : "1px solid transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "monospace", color: score > 0 ? "#65e5ff" : "#64748b" }}>
                      {score > 0 ? `${score.toFixed(0)}%` : "—"}
                    </span>

                    <div style={{ height: "100px", width: "24px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "6px", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                      <div
                        style={{
                          width: "100%",
                          height: `${Math.max(4, score)}%`,
                          background: isSelected
                            ? "linear-gradient(180deg, #65e5ff, #3b82f6)"
                            : "linear-gradient(180deg, #a78bfa, #6366f1)",
                          borderRadius: "4px",
                          transition: "height 0.5s ease",
                        }}
                      />
                    </div>

                    <span style={{ fontSize: "9px", color: isSelected ? "#65e5ff" : "#94a3b8", fontWeight: isSelected ? 700 : 500 }}>
                      {ds.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {timeframe === "Monthly" && (
        <div style={{ display: "grid", gap: "16px" }}>
          <div
            style={{
              borderRadius: "24px",
              padding: "20px",
              background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                Monthly Heatmap ({monthly?.month || selectedDate.slice(0, 7)})
              </h3>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#65e5ff", fontFamily: "monospace" }}>
                Avg: {monthly?.monthly_score?.toFixed(0) ?? 0}%
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
              {(monthly?.calendar_days || []).map((cd) => {
                const isSelected = cd.date === selectedDate;
                const hasScore = cd.score > 0;
                return (
                  <button
                    key={cd.date}
                    onClick={() => setSelectedDate(cd.date)}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "10px",
                      border: isSelected ? "1px solid #65e5ff" : "1px solid rgba(255, 255, 255, 0.04)",
                      background: hasScore
                        ? `rgba(101, 229, 255, ${Math.max(0.1, cd.score / 200)})`
                        : "rgba(255, 255, 255, 0.02)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2px",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "10px", color: isSelected ? "#65e5ff" : "#94a3b8" }}>{cd.day}</span>
                    <span style={{ fontSize: "8px", fontWeight: 700, fontFamily: "monospace", color: hasScore ? "#f1f5f9" : "#475569" }}>
                      {hasScore ? `${cd.score.toFixed(0)}` : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {timeframe === "Yearly" && (
        <div style={{ display: "grid", gap: "16px" }}>
          <div
            style={{
              borderRadius: "24px",
              padding: "20px",
              background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 16px" }}>
              Yearly Overview ({yearly?.year ?? new Date().getFullYear()})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
              {(yearly?.months || []).map((m) => (
                <div key={m.month} style={{ padding: "12px", borderRadius: "14px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <span style={{ fontSize: "10px", color: "#8a96ad" }}>{m.month_name}</span>
                  <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: "monospace", color: "#65e5ff", marginTop: "4px" }}>
                    {m.avg_score.toFixed(0)}%
                  </div>
                  <span style={{ fontSize: "8px", color: "#64748b" }}>{m.days_tracked} days logged</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
