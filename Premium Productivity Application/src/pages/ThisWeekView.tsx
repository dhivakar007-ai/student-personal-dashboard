import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, CalendarDays, Code2, FileText, TrendingUp,
  BookOpen, MessageCircle, Dumbbell, Brain, CheckCircle2,
} from "lucide-react";
import { analyticsApi, planningApi, tasksApi } from "../lib/godhqApi";
import { useDate } from "../context/DateContext";
import type { WeeklyAnalytics, WeeklyReview, Task } from "../types";

export function ThisWeekView() {
  const { selectedDate } = useDate();
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [reviewNotes, setReviewNotes] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  const tabs = ["Overview", "Habits", "Tasks", "DSA & Learning", "Review"];

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [wData, rData, tData] = await Promise.allSettled([
          analyticsApi.getWeekly(selectedDate),
          planningApi.getWeeklyReview(selectedDate),
          tasksApi.list(),
        ]);
        if (isMounted) {
          if (wData.status === "fulfilled") setWeekly(wData.value);
          if (rData.status === "fulfilled") {
            setReview(rData.value);
            setReviewNotes(rData.value?.what_went_well || "");
          }
          if (tData.status === "fulfilled") setTasks(tData.value);
        }
      } catch (err) {
        console.error("Failed to load weekly data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedDate]);

  const daysTracked = weekly?.days_tracked ?? 0;
  const weeklyScore = weekly?.weekly_score != null ? Math.round(weekly.weekly_score) : null;
  const codingHours = weekly?.total_coding_hours ?? 0;
  const dsaTotal = weekly?.total_dsa ?? 0;
  const readingHours = weekly?.total_reading_hours ?? 0;
  const commHours = weekly?.total_comm_hours ?? 0;
  const workoutSessions = weekly?.workout_sessions ?? 0;
  const consistency = daysTracked > 0 ? Math.round((daysTracked / 7) * 100) : 0;

  const weekStart = selectedDate;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const totalTasks = tasks.length;

  const handleSaveReview = async () => {
    setSavingReview(true);
    try {
      await planningApi.updateWeeklyReview(selectedDate, { what_went_well: reviewNotes });
    } catch (err) {
      console.error("Failed to save weekly review:", err);
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <motion.div className="product-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="product-heading">
        <div className="product-title-icon"><BarChart3 size={19} /></div>
        <div>
          <span>WEEKLY SYSTEM</span>
          <strong>This Week</strong>
          <small>Seven-day aggregation, habit tracking, and performance review around {selectedDate}.</small>
        </div>
        <span className="connection-state state-live">LIVE ANALYTICS</span>
      </div>

      <div className="product-tabs">
        {tabs.map((tab) => (
          <button
            className={tab === activeTab ? "product-tab-active" : ""}
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="page-metric-row">
        <div className="page-metric metric-0">
          <span>WEEKLY SCORE</span>
          <strong>{weeklyScore !== null ? `${weeklyScore}%` : "—"}</strong>
          <small>{daysTracked > 0 ? `${daysTracked} of 7 days logged` : "No recorded days"}</small>
        </div>
        <div className="page-metric metric-1">
          <span>CONSISTENCY</span>
          <strong>{consistency}%</strong>
          <small>{daysTracked} TRACKED DAYS</small>
        </div>
        <div className="page-metric metric-2">
          <span>CODING TOTAL</span>
          <strong>{codingHours}h</strong>
          <small>ENGINEERING EFFORT</small>
        </div>
        <div className="page-metric metric-0">
          <span>TASKS DONE</span>
          <strong>{completedTasks}/{totalTasks}</strong>
          <small>COMPLETION RATE</small>
        </div>
      </div>

      <div className="page-content-grid">
        <section className="page-primary-panel">
          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b", fontSize: "12px" }}>
              Loading weekly analytics...
            </div>
          ) : daysTracked === 0 && activeTab === "Overview" ? (
            <div className="page-empty" style={{ minHeight: "180px" }}>
              <CalendarDays size={24} />
              <strong>No recorded days in this 7-day period</strong>
              <span>Log daily habits and tasks via Today to populate weekly analytics.</span>
            </div>
          ) : (
            <>
              {activeTab === "Overview" && (
                <div style={{ display: "grid", gap: "10px" }}>
                  <div style={{ padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "10px", color: "#8e99ac", display: "block", marginBottom: "6px" }}>Weekly Performance</span>
                    <strong style={{ fontSize: "14px", color: "#60e7dc" }}>
                      {daysTracked >= 5 ? "Consistent Week · Strong Execution" : daysTracked >= 3 ? "Developing Momentum" : "Early Stage — Keep Going"}
                    </strong>
                    <p style={{ fontSize: "11px", color: "#a0aec0", margin: "6px 0 0" }}>
                      {daysTracked} active days. Score: {weeklyScore !== null ? `${weeklyScore}%` : "insufficient data"}. Engineering: {codingHours}h. DSA: {dsaTotal} problems.
                    </p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {[
                      { icon: Code2, label: "Coding", value: `${codingHours}h`, color: "#60e7dc" },
                      { icon: Brain, label: "DSA Problems", value: dsaTotal.toString(), color: "#a78bfa" },
                      { icon: BookOpen, label: "Reading", value: `${readingHours}h`, color: "#fbbf24" },
                      { icon: MessageCircle, label: "Communication", value: `${commHours}h`, color: "#fb923c" },
                      { icon: Dumbbell, label: "Workouts", value: workoutSessions.toString(), color: "#34d399" },
                      { icon: TrendingUp, label: "Days Tracked", value: `${daysTracked}/7`, color: "#7493ff" },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.025)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <Icon size={14} style={{ color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "10px", color: "#64748b" }}>{label}</div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#e2e8f0" }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Habits" && (
                <div style={{ display: "grid", gap: "10px" }}>
                  {weekly?.matrix && weekly.matrix.length > 0 ? (
                    <>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px" }}>7-Day Habit Matrix</div>
                      {weekly.matrix.map((row) => (
                        <div key={row.habit} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px", alignItems: "center" }}>
                          <span style={{ fontSize: "10px", color: "#8e99ac", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.habit}</span>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {row.days.map((done, i) => (
                              <div key={i} style={{ width: 22, height: 22, borderRadius: "6px", background: done ? "#60e7dc22" : "rgba(255,255,255,0.04)", border: `1px solid ${done ? "#60e7dc" : "rgba(255,255,255,0.07)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {done && <CheckCircle2 size={12} style={{ color: "#60e7dc" }} />}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="page-empty" style={{ minHeight: "140px" }}>
                      <CalendarDays size={22} />
                      <strong>No habit matrix data yet</strong>
                      <span>Complete daily habits in Today to build your weekly matrix.</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Tasks" && (
                <div style={{ display: "grid", gap: "8px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9", marginBottom: "4px" }}>
                    Weekly Tasks — {completedTasks} of {totalTasks} completed
                  </div>
                  {tasks.length === 0 ? (
                    <div className="page-empty" style={{ minHeight: "140px" }}>
                      <CheckCircle2 size={22} />
                      <strong>No tasks recorded</strong>
                      <span>Create tasks in the Tasks tab to track weekly progress.</span>
                    </div>
                  ) : tasks.slice(0, 15).map((t) => (
                    <div key={t.id} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.priority === "P1" ? "#f87171" : t.priority === "P2" ? "#fbbf24" : "#60e7dc", flexShrink: 0 }} />
                      <span style={{ fontSize: "11px", color: t.status === "Completed" ? "#475569" : "#e2e8f0", textDecoration: t.status === "Completed" ? "line-through" : "none", flex: 1 }}>{t.title}</span>
                      <span style={{ fontSize: "9px", color: "#475569", flexShrink: 0 }}>{t.category}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "DSA & Learning" && (
                <div style={{ display: "grid", gap: "10px" }}>
                  <div style={{ padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "10px", color: "#8e99ac", display: "block", marginBottom: "8px" }}>This Week's Learning Stats</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <div style={{ fontSize: "10px", color: "#64748b" }}>DSA Problems</div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "#a78bfa" }}>{dsaTotal}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "10px", color: "#64748b" }}>Reading Hours</div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "#fbbf24" }}>{readingHours}h</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "10px", color: "#64748b" }}>Coding Hours</div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "#60e7dc" }}>{codingHours}h</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "10px", color: "#64748b" }}>Comm Hours</div>
                        <div style={{ fontSize: "20px", fontWeight: 800, color: "#fb923c" }}>{commHours}h</div>
                      </div>
                    </div>
                    {dsaTotal === 0 && codingHours === 0 && (
                      <p style={{ fontSize: "10px", color: "#475569", marginTop: "10px", margin: "10px 0 0" }}>
                        No learning data recorded this week. Log coding time and DSA problems in Today's metrics.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Review" && (
                <div style={{ display: "grid", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9" }}>Weekly Retrospective</span>
                    <button
                      onClick={handleSaveReview}
                      disabled={savingReview}
                      style={{ padding: "6px 14px", borderRadius: "8px", background: "#60e7dc22", border: "1px solid #60e7dc55", color: "#60e7dc", cursor: "pointer", fontSize: "10px", fontWeight: 600 }}
                    >
                      {savingReview ? "Saving..." : "Save Review"}
                    </button>
                  </div>
                  {[
                    { field: "what_went_well" as keyof WeeklyReview, label: "What went well?" },
                    { field: "what_went_wrong" as keyof WeeklyReview, label: "What went wrong?" },
                    { field: "what_learned" as keyof WeeklyReview, label: "What did I learn?" },
                    { field: "next_week_priority" as keyof WeeklyReview, label: "Next week's main priority?" },
                  ].map(({ field, label }) => (
                    <label key={field} style={{ display: "grid", gap: "4px" }}>
                      <span style={{ fontSize: "10px", color: "#8e99ac" }}>{label}</span>
                      <textarea
                        rows={3}
                        value={(review as any)?.[field] || ""}
                        onChange={(e) => setReview((prev) => prev ? { ...prev, [field]: e.target.value } : prev)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        style={{ padding: "8px", borderRadius: "8px", background: "#111625", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "11px", resize: "vertical" }}
                      />
                    </label>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <aside className="page-side-stack">
          <div className="page-side-item">
            <span><TrendingUp size={15} /></span>
            <div>
              <strong>Aggregated Daily Data</strong>
              <small>All metrics calculated from real daily records</small>
            </div>
          </div>
          <div className="page-side-item side-1">
            <span><Code2 size={15} /></span>
            <div>
              <strong>Engineering Practice</strong>
              <small>{codingHours}h coding · {dsaTotal} DSA problems</small>
            </div>
          </div>
          <div className="page-side-item side-2">
            <span><FileText size={15} /></span>
            <div>
              <strong>Weekly Review</strong>
              <small>{review?.what_went_well ? "Retrospective recorded" : "Write your weekly review"}</small>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
