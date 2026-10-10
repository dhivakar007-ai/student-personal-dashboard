import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays, TrendingUp, Archive, Code2, Brain,
  BookOpen, MessageCircle, Dumbbell, FileText, CheckCircle2,
} from "lucide-react";
import { analyticsApi, planningApi, tasksApi, growthApi } from "../lib/godhqApi";
import { useDate } from "../context/DateContext";
import type { MonthlyAnalytics, MonthlyReview, Task, Goal } from "../types";

export function ThisMonthView() {
  const { selectedDate } = useDate();
  const [monthly, setMonthly] = useState<MonthlyAnalytics | null>(null);
  const [review, setReview] = useState<MonthlyReview | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [savingReview, setSavingReview] = useState(false);

  const tabs = ["Overview", "Habits", "Goals & Projects", "DSA & Learning", "Review"];

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const monthStr = selectedDate.slice(0, 7);
        const [mData, rData, tData, gData] = await Promise.allSettled([
          analyticsApi.getMonthly(selectedDate),
          planningApi.getMonthlyReview(monthStr),
          tasksApi.list(),
          growthApi.getGoals(),
        ]);
        if (isMounted) {
          if (mData.status === "fulfilled") setMonthly(mData.value);
          if (rData.status === "fulfilled") setReview(rData.value);
          if (tData.status === "fulfilled") setTasks(tData.value);
          if (gData.status === "fulfilled") setGoals(gData.value);
        }
      } catch (err) {
        console.error("Failed to load monthly data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedDate]);

  const daysTracked = monthly?.days_tracked ?? 0;
  const totalDays = monthly?.total_days ?? 30;
  const monthlyScore = monthly?.monthly_score != null ? Math.round(monthly.monthly_score) : null;
  const consistency = daysTracked > 0 ? Math.round((daysTracked / totalDays) * 100) : 0;
  const codingHours = monthly?.total_coding_hours ?? 0;
  const dsaTotal = monthly?.total_dsa ?? 0;
  const readingHours = monthly?.total_reading_hours ?? 0;
  const commHours = monthly?.total_comm_hours ?? 0;
  const workoutSessions = monthly?.workout_sessions ?? 0;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const activeGoals = goals.filter((g) => g.status === "Active");
  const reviewSummary = review?.biggest_achievement || review?.biggest_lesson || null;

  const handleSaveReview = async () => {
    if (!review) return;
    setSavingReview(true);
    try {
      const monthStr = selectedDate.slice(0, 7);
      await planningApi.updateMonthlyReview(monthStr, review);
    } catch (err) {
      console.error("Failed to save monthly review:", err);
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <motion.div className="product-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="product-heading">
        <div className="product-title-icon"><CalendarDays size={19} /></div>
        <div>
          <span>MONTHLY DIRECTION</span>
          <strong>This Month</strong>
          <small>Long-range consistency, aggregate habit performance, and monthly review for {selectedDate.slice(0, 7)}.</small>
        </div>
        <span className="connection-state state-live">LIVE ANALYTICS</span>
      </div>

      <div className="product-tabs">
        {tabs.map((tab) => (
          <button className={tab === activeTab ? "product-tab-active" : ""} onClick={() => setActiveTab(tab)} key={tab}>
            {tab}
          </button>
        ))}
      </div>

      <div className="page-metric-row">
        <div className="page-metric metric-0">
          <span>MONTHLY SCORE</span>
          <strong>{monthlyScore !== null ? `${monthlyScore}%` : "—"}</strong>
          <small>{daysTracked > 0 ? `${daysTracked} days recorded` : "No records this month"}</small>
        </div>
        <div className="page-metric metric-1">
          <span>TRACKED DAYS</span>
          <strong>{daysTracked}</strong>
          <small>OUT OF {totalDays} DAYS</small>
        </div>
        <div className="page-metric metric-2">
          <span>CONSISTENCY</span>
          <strong>{consistency}%</strong>
          <small>MONTH RECORD RATIO</small>
        </div>
        <div className="page-metric metric-0">
          <span>MONTHLY REVIEW</span>
          <strong>{reviewSummary ? "Recorded" : "Not written"}</strong>
          <small>{reviewSummary ? "COMPLETED" : "PENDING"}</small>
        </div>
      </div>

      <div className="page-content-grid">
        <section className="page-primary-panel">
          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b", fontSize: "12px" }}>Loading monthly analytics...</div>
          ) : (
            <>
              {activeTab === "Overview" && (
                <div style={{ display: "grid", gap: "10px" }}>
                  {daysTracked === 0 ? (
                    <div className="page-empty" style={{ minHeight: "160px" }}>
                      <Archive size={24} />
                      <strong>No monthly records found for this period</strong>
                      <span>Daily scores and habit checkboxes automatically roll up into monthly trends.</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: "10px", color: "#8e99ac", display: "block", marginBottom: "4px" }}>Monthly Trajectory</span>
                        <strong style={{ fontSize: "14px", color: "#7493ff" }}>
                          {daysTracked >= 20 ? "Consistent Monthly Execution" : daysTracked >= 10 ? "Developing Stage" : "Early / New Month"}
                        </strong>
                        <p style={{ fontSize: "11px", color: "#a0aec0", margin: "6px 0 0" }}>
                          {daysTracked} active tracked days with an average performance of {monthlyScore !== null ? `${monthlyScore}%` : "insufficient data"}.
                        </p>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        {[
                          { icon: Code2, label: "Coding", value: `${codingHours}h`, color: "#60e7dc" },
                          { icon: Brain, label: "DSA", value: dsaTotal.toString(), color: "#a78bfa" },
                          { icon: BookOpen, label: "Reading", value: `${readingHours}h`, color: "#fbbf24" },
                          { icon: MessageCircle, label: "Communication", value: `${commHours}h`, color: "#fb923c" },
                          { icon: Dumbbell, label: "Workouts", value: workoutSessions.toString(), color: "#34d399" },
                          { icon: CheckCircle2, label: "Tasks Done", value: completedTasks.toString(), color: "#7493ff" },
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
                      {monthly?.best_day && (
                        <div style={{ padding: "10px 14px", background: "rgba(96,231,220,0.06)", borderRadius: "10px", border: "1px solid rgba(96,231,220,0.15)", fontSize: "11px", color: "#e2e8f0" }}>
                          🏆 Best day: <strong style={{ color: "#60e7dc" }}>{monthly.best_day}</strong>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "Habits" && (
                <div style={{ display: "grid", gap: "10px" }}>
                  {monthly?.calendar_days && monthly.calendar_days.length > 0 ? (
                    <>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9" }}>Monthly Calendar Heatmap</span>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                          <div key={i} style={{ textAlign: "center", fontSize: "9px", color: "#64748b", paddingBottom: "4px" }}>{d}</div>
                        ))}
                        {monthly.calendar_days.map((day) => {
                          const intensity = day.intensity ?? 0;
                          const bg = intensity === 0 ? "rgba(255,255,255,0.04)" : intensity === 1 ? "rgba(96,231,220,0.15)" : intensity === 2 ? "rgba(96,231,220,0.3)" : intensity === 3 ? "rgba(96,231,220,0.5)" : "rgba(96,231,220,0.8)";
                          return (
                            <div key={day.date} title={`${day.date}: ${Math.round(day.score)}%`} style={{ aspectRatio: "1", borderRadius: "4px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "#e2e8f0" }}>
                              {day.day}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="page-empty" style={{ minHeight: "140px" }}>
                      <CalendarDays size={22} />
                      <strong>No habit data for this month</strong>
                      <span>Complete daily habits to build the monthly calendar.</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "Goals & Projects" && (
                <div style={{ display: "grid", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9" }}>Active Goals — {activeGoals.length} total</span>
                  {activeGoals.length === 0 ? (
                    <div className="page-empty" style={{ minHeight: "120px" }}>
                      <TrendingUp size={22} />
                      <strong>No active goals</strong>
                      <span>Create goals in the Projects tab to track monthly objectives.</span>
                    </div>
                  ) : activeGoals.map((g) => (
                    <div key={g.id} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: 600 }}>{g.title}</span>
                        <span style={{ fontSize: "10px", color: "#7493ff" }}>{g.progress}%</span>
                      </div>
                      <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "99px" }}>
                        <div style={{ height: "100%", width: `${g.progress}%`, background: "#7493ff", borderRadius: "99px", transition: "width 0.3s" }} />
                      </div>
                      {g.deadline && <div style={{ fontSize: "9px", color: "#475569", marginTop: "4px" }}>Deadline: {g.deadline}</div>}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "DSA & Learning" && (
                <div style={{ display: "grid", gap: "10px" }}>
                  <div style={{ padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "10px", color: "#8e99ac", display: "block", marginBottom: "8px" }}>Monthly Learning Stats</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {[
                        { label: "DSA Problems", value: dsaTotal, color: "#a78bfa" },
                        { label: "Coding Hours", value: `${codingHours}h`, color: "#60e7dc" },
                        { label: "Reading Hours", value: `${readingHours}h`, color: "#fbbf24" },
                        { label: "Comm Hours", value: `${commHours}h`, color: "#fb923c" },
                        { label: "Learning Hours", value: `${monthly?.learning_hours ?? 0}h`, color: "#34d399" },
                        { label: "Project Hours", value: `${monthly?.project_hours ?? 0}h`, color: "#7493ff" },
                      ].map(({ label, value, color }) => (
                        <div key={label}>
                          <div style={{ fontSize: "10px", color: "#64748b" }}>{label}</div>
                          <div style={{ fontSize: "20px", fontWeight: 800, color }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Review" && (
                <div style={{ display: "grid", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9" }}>Monthly Retrospective — {selectedDate.slice(0, 7)}</span>
                    <button onClick={handleSaveReview} disabled={savingReview} style={{ padding: "6px 14px", borderRadius: "8px", background: "#7493ff22", border: "1px solid #7493ff55", color: "#7493ff", cursor: "pointer", fontSize: "10px", fontWeight: 600 }}>
                      {savingReview ? "Saving..." : "Save Review"}
                    </button>
                  </div>
                  {[
                    { field: "biggest_achievement" as keyof MonthlyReview, label: "Biggest achievement?" },
                    { field: "biggest_mistake" as keyof MonthlyReview, label: "Biggest mistake?" },
                    { field: "biggest_lesson" as keyof MonthlyReview, label: "Biggest lesson?" },
                    { field: "what_improved" as keyof MonthlyReview, label: "What improved?" },
                    { field: "what_needs_improvement" as keyof MonthlyReview, label: "What needs improvement?" },
                    { field: "main_objective" as keyof MonthlyReview, label: "Main objective next month?" },
                  ].map(({ field, label }) => (
                    <label key={field} style={{ display: "grid", gap: "4px" }}>
                      <span style={{ fontSize: "10px", color: "#8e99ac" }}>{label}</span>
                      <textarea
                        rows={2}
                        value={(review as any)?.[field] || ""}
                        onChange={(e) => setReview((prev) => prev ? { ...prev, [field]: e.target.value } : null)}
                        placeholder={label}
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
            <div><strong>Monthly Performance</strong><small>Evaluates long-term stability across weeks</small></div>
          </div>
          <div className="page-side-item side-1">
            <span><Dumbbell size={15} /></span>
            <div><strong>Habit Retention</strong><small>{consistency}% adherence rate this month</small></div>
          </div>
          <div className="page-side-item side-2">
            <span><FileText size={15} /></span>
            <div><strong>Retrospective</strong><small>{reviewSummary ? "Review documented" : "Schedule at end of month"}</small></div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
