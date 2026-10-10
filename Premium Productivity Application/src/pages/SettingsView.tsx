import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, HardDrive, Database, Sliders, Clock, Info } from "lucide-react";
import { settingsApi } from "../lib/godhqApi";
import type { UserSettings } from "../types";

const TIMER_KEY = "godhq_timer_prefs";
function loadTimerPrefs() {
  try { return JSON.parse(localStorage.getItem(TIMER_KEY) || "{}"); } catch { return {}; }
}
function saveTimerPrefs(prefs: object) {
  localStorage.setItem(TIMER_KEY, JSON.stringify(prefs));
}

export function SettingsView({ onShowToast }: { onShowToast?: (msg: string) => void }) {
  const tabs = ["Tracking & Weights", "Timer & Schedule", "Appearance & System", "Data & Storage"];
  const [activeTab, setActiveTab] = useState("Tracking & Weights");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tracking weights
  const [healthWeight, setHealthWeight] = useState(20);
  const [brainWeight, setBrainWeight] = useState(25);
  const [engWeight, setEngWeight] = useState(30);
  const [commWeight, setCommWeight] = useState(15);
  const [discWeight, setDiscWeight] = useState(10);

  // Metric targets
  const [codingTarget, setCodingTarget] = useState(120);
  const [dsaTarget, setDsaTarget] = useState(2);
  const [sleepTarget, setSleepTarget] = useState(8);
  const [readingTarget, setReadingTarget] = useState(20);
  const [meditationTarget, setMeditationTarget] = useState(5);
  const [waterTarget, setWaterTarget] = useState(3);
  const [walkTarget, setWalkTarget] = useState(30);
  const [wakeTime, setWakeTime] = useState("06:00");

  // Timer prefs (localStorage)
  const [focusDur, setFocusDur] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);

  useEffect(() => {
    const prefs = loadTimerPrefs();
    if (prefs.focusDur) setFocusDur(prefs.focusDur);
    if (prefs.shortBreak) setShortBreak(prefs.shortBreak);
    if (prefs.longBreak) setLongBreak(prefs.longBreak);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const s = await settingsApi.get();
        if (isMounted && s) {
          setHealthWeight(s.health_weight ?? 20);
          setBrainWeight(s.brain_weight ?? 25);
          setEngWeight(s.engineering_weight ?? 30);
          setCommWeight(s.communication_weight ?? 15);
          setDiscWeight(s.discipline_weight ?? 10);
          setCodingTarget(s.target_coding_min ?? 120);
          setDsaTarget(s.target_dsa_problems ?? 2);
          setSleepTarget(s.target_sleep_hours ?? 8);
          setReadingTarget(s.target_reading_min ?? 20);
          setMeditationTarget(s.target_meditation_min ?? 5);
          setWaterTarget(s.target_water_l ?? 3);
          setWalkTarget(s.target_walk_min ?? 30);
          if (s.target_wake_time) setWakeTime(s.target_wake_time);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const weightSum = healthWeight + brainWeight + engWeight + commWeight + discWeight;

  const handleSaveTracking = async () => {
    setSaving(true);
    try {
      await settingsApi.update({
        health_weight: healthWeight, brain_weight: brainWeight,
        engineering_weight: engWeight, communication_weight: commWeight,
        discipline_weight: discWeight, target_coding_min: codingTarget,
        target_dsa_problems: dsaTarget, target_sleep_hours: sleepTarget,
        target_reading_min: readingTarget, target_meditation_min: meditationTarget,
        target_water_l: waterTarget, target_walk_min: walkTarget,
        target_wake_time: wakeTime,
      });
      if (onShowToast) onShowToast("Settings saved to SQLite database.");
    } catch (err) {
      console.error("Failed to save settings:", err);
      if (onShowToast) onShowToast("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTimer = () => {
    saveTimerPrefs({ focusDur, shortBreak, longBreak });
    if (onShowToast) onShowToast("Timer preferences saved locally.");
  };

  const InputRow = ({ label, value, onChange, unit, min = 0, max = 999, step = 1 }: { label: string; value: number | string; onChange: (v: any) => void; unit?: string; min?: number; max?: number; step?: number }) => (
    <label style={{ display: "grid", gap: "4px" }}>
      <span style={{ fontSize: "10px", color: "#8a97ad" }}>{label}{unit ? ` (${unit})` : ""}</span>
      <input
        type={typeof value === "number" ? "number" : "time"}
        value={value}
        min={min} max={max} step={step}
        onChange={(e) => onChange(typeof value === "number" ? Number(e.target.value) : e.target.value)}
        style={{ padding: "8px", borderRadius: "8px", background: "#111625", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "12px" }}
      />
    </label>
  );

  return (
    <motion.div className="product-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="product-heading">
        <div className="product-title-icon"><Settings size={19} /></div>
        <div>
          <span>SYSTEM CONFIGURATION</span>
          <strong>Settings</strong>
          <small>Configure scoring weights, metric targets, timer preferences, and view system status.</small>
        </div>
        <span className="connection-state state-live">LIVE SETTINGS</span>
      </div>

      <div className="product-tabs">
        {tabs.map((tab) => <button className={tab === activeTab ? "product-tab-active" : ""} onClick={() => setActiveTab(tab)} key={tab}>{tab}</button>)}
      </div>

      <div className="page-metric-row">
        <div className="page-metric metric-0"><span>STORAGE ENGINE</span><strong>SQLite 3</strong><small>OFFLINE LOCAL DB</small></div>
        <div className="page-metric metric-1"><span>WEIGHT SUM</span><strong style={{ color: weightSum === 100 ? "#34d399" : "#f87171" }}>{weightSum}%</strong><small>{weightSum === 100 ? "BALANCED" : "REBALANCE NEEDED"}</small></div>
        <div className="page-metric metric-2"><span>BACKEND</span><strong>FastAPI</strong><small>STANDALONE PROCESS</small></div>
        <div className="page-metric metric-0"><span>VERSION</span><strong>v1.0.0</strong><small>DESKTOP BUILD</small></div>
      </div>

      <div className="page-content-grid">
        <section className="page-primary-panel">
          {loading ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "#64748b", fontSize: "12px" }}>Loading settings...</div>
          ) : (
            <>
              {activeTab === "Tracking & Weights" && (
                <div style={{ display: "grid", gap: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9" }}>Category Scoring Weights</span>
                    <button onClick={handleSaveTracking} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", background: "#60e7dc22", border: "1px solid #60e7dc66", color: "#60e7dc", cursor: "pointer", fontSize: "10px", fontWeight: 600 }}>
                      <Save size={12} />{saving ? "Saving..." : "Save Config"}
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <InputRow label="Engineering Weight" value={engWeight} onChange={setEngWeight} unit="%" min={0} max={100} />
                    <InputRow label="Brain / Learning Weight" value={brainWeight} onChange={setBrainWeight} unit="%" min={0} max={100} />
                    <InputRow label="Health Weight" value={healthWeight} onChange={setHealthWeight} unit="%" min={0} max={100} />
                    <InputRow label="Communication Weight" value={commWeight} onChange={setCommWeight} unit="%" min={0} max={100} />
                    <InputRow label="Discipline Weight" value={discWeight} onChange={setDiscWeight} unit="%" min={0} max={100} />
                    {weightSum !== 100 && (
                      <div style={{ gridColumn: "1/-1", padding: "8px 12px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "8px", fontSize: "10px", color: "#f87171" }}>
                        ⚠ Weights sum to {weightSum}%. They must total 100% for accurate scoring.
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9", display: "block", marginBottom: "10px" }}>Daily Metric Targets</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <InputRow label="Wake Time" value={wakeTime} onChange={setWakeTime} />
                      <InputRow label="Sleep Target" value={sleepTarget} onChange={setSleepTarget} unit="hours" step={0.5} />
                      <InputRow label="Coding Target" value={codingTarget} onChange={setCodingTarget} unit="min" />
                      <InputRow label="DSA Target" value={dsaTarget} onChange={setDsaTarget} unit="problems" />
                      <InputRow label="Reading Target" value={readingTarget} onChange={setReadingTarget} unit="min" />
                      <InputRow label="Meditation Target" value={meditationTarget} onChange={setMeditationTarget} unit="min" />
                      <InputRow label="Water Target" value={waterTarget} onChange={setWaterTarget} unit="liters" step={0.25} />
                      <InputRow label="Walk Target" value={walkTarget} onChange={setWalkTarget} unit="min" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Timer & Schedule" && (
                <div style={{ display: "grid", gap: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9" }}>Timer Preferences</span>
                    <button onClick={handleSaveTimer} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", background: "#7493ff22", border: "1px solid #7493ff66", color: "#7493ff", cursor: "pointer", fontSize: "10px", fontWeight: 600 }}>
                      <Save size={12} />Save Timer Prefs
                    </button>
                  </div>
                  <div style={{ padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", fontSize: "10px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Info size={12} /> Timer preferences are saved locally and applied in the Timer tab.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                    <InputRow label="Focus Duration" value={focusDur} onChange={setFocusDur} unit="min" min={1} max={120} />
                    <InputRow label="Short Break" value={shortBreak} onChange={setShortBreak} unit="min" min={1} max={30} />
                    <InputRow label="Long Break" value={longBreak} onChange={setLongBreak} unit="min" min={5} max={60} />
                  </div>
                </div>
              )}

              {activeTab === "Appearance & System" && (
                <div style={{ display: "grid", gap: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9" }}>Theme & System</span>
                  {[
                    { label: "Theme Preset", value: "Deep Obsidian / Figma Premium" },
                    { label: "GPU Acceleration", value: "Enabled (Electron Hardware)" },
                    { label: "Minimum Resolution", value: "1024 × 680 px" },
                    { label: "Target Resolution", value: "1440 × 900 px" },
                    { label: "App Version", value: "v1.0.0" },
                    { label: "Electron Version", value: "44.5.1" },
                    { label: "Frontend", value: "React 19 + Vite 8" },
                    { label: "Backend", value: "FastAPI + Python + SQLAlchemy" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(255,255,255,0.025)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>{label}</span>
                      <span style={{ fontSize: "11px", color: "#60e7dc", fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Data & Storage" && (
                <div style={{ display: "grid", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#60e7dc" }}>
                    <Database size={16} /><strong style={{ fontSize: "12px" }}>Isolated User Data Storage</strong>
                  </div>
                  <div style={{ padding: "14px", background: "rgba(255,255,255,0.025)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", display: "grid", gap: "10px" }}>
                    <p style={{ fontSize: "11px", color: "#a0aec0", margin: 0, lineHeight: 1.6 }}>
                      Your database is maintained independently from application binaries at:
                    </p>
                    <code style={{ fontSize: "10px", color: "#fcd34d", background: "rgba(0,0,0,0.3)", padding: "6px 10px", borderRadius: "6px", display: "block" }}>
                      %APPDATA%\GOD-HQ\god_hq.db
                    </code>
                    <p style={{ fontSize: "10px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                      Application updates replace frontend assets only. Your stored tasks, habits, diary entries, and daily records are never reset or overwritten by updates.
                    </p>
                  </div>
                  <div style={{ padding: "14px", background: "rgba(255,255,255,0.025)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", display: "grid", gap: "8px" }}>
                    <strong style={{ fontSize: "11px", color: "#f1f5f9" }}>Database Tables (13 total)</strong>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                      {["daily_records", "tasks", "diary_entries", "activity_logs", "goals", "projects", "user_settings", "weekly_reviews", "monthly_reviews", "dsa_entries", "communication_entries", "certifications", "competitions"].map((t) => (
                        <span key={t} style={{ fontSize: "9px", color: "#475569", background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "4px 8px", border: "1px solid rgba(255,255,255,0.05)" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: "12px", background: "rgba(248,113,113,0.05)", borderRadius: "10px", border: "1px solid rgba(248,113,113,0.15)", fontSize: "10px", color: "#94a3b8", lineHeight: 1.5 }}>
                    ⚠ To backup your data, copy the database file from <code style={{ color: "#fcd34d" }}>%APPDATA%\GOD-HQ\</code> to a safe location. Do not delete or reset this file unless you intend to start fresh.
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="page-side-stack">
          <div className="page-side-item">
            <span><Sliders size={15} /></span>
            <div><strong>Weight Balancing</strong><small>Score calculation uses category weights — must sum to 100%</small></div>
          </div>
          <div className="page-side-item side-1">
            <span><HardDrive size={15} /></span>
            <div><strong>Local Isolation</strong><small>All data operations are 100% offline</small></div>
          </div>
          <div className="page-side-item side-2">
            <span><Clock size={15} /></span>
            <div><strong>Timer Prefs</strong><small>Applied in the Timer tab on next session</small></div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
