import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Brain, Save, History, ChevronRight, Clock } from "lucide-react";
import { diaryApi, analyticsApi } from "../lib/godhqApi";
import { useDate } from "../context/DateContext";
import type { DiaryEntry, DailyRecord } from "../types";

export function DiaryView({ onShowToast }: { onShowToast?: (msg: string) => void }) {
  const { selectedDate, setSelectedDate } = useDate();
  const tabs = ["Today's Entry", "History"];
  const [activeTab, setActiveTab] = useState("Today's Entry");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasEntry, setHasEntry] = useState(false);

  // Entry fields — exactly matching DiaryEntry type
  const [whatHappened, setWhatHappened] = useState("");
  const [whatAccomplished, setWhatAccomplished] = useState("");
  const [whatLearned, setWhatLearned] = useState("");
  const [whatWentWrong, setWhatWentWrong] = useState("");
  const [tomorrowPriority, setTomorrowPriority] = useState("");

  // History
  const [historyDates, setHistoryDates] = useState<DailyRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPreviews, setHistoryPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadEntry() {
      setLoading(true);
      try {
        const entry = await diaryApi.get(selectedDate);
        if (isMounted && entry) {
          setWhatHappened(entry.what_happened || "");
          setWhatAccomplished(entry.what_accomplished || "");
          setWhatLearned(entry.what_learned || "");
          setWhatWentWrong(entry.what_went_wrong || "");
          setTomorrowPriority(entry.tomorrow_priority || "");
          setHasEntry(true);
        } else if (isMounted) {
          setWhatHappened(""); setWhatAccomplished(""); setWhatLearned("");
          setWhatWentWrong(""); setTomorrowPriority(""); setHasEntry(false);
        }
      } catch {
        if (isMounted) {
          setWhatHappened(""); setWhatAccomplished(""); setWhatLearned("");
          setWhatWentWrong(""); setTomorrowPriority(""); setHasEntry(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadEntry();
    return () => { isMounted = false; };
  }, [selectedDate]);

  useEffect(() => {
    if (activeTab !== "History") return;
    let isMounted = true;
    async function loadHistory() {
      setHistoryLoading(true);
      try {
        const records = await analyticsApi.getHistory();
        if (isMounted) {
          setHistoryDates(records.slice(0, 30)); // last 30 days with records
          // Load preview for each
          const previews: Record<string, string> = {};
          await Promise.allSettled(
            records.slice(0, 10).map(async (r) => {
              try {
                const entry = await diaryApi.get(r.date);
                if (entry?.what_happened) previews[r.date] = entry.what_happened.slice(0, 80);
              } catch {}
            })
          );
          if (isMounted) setHistoryPreviews(previews);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        if (isMounted) setHistoryLoading(false);
      }
    }
    loadHistory();
    return () => { isMounted = false; };
  }, [activeTab]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await diaryApi.update(selectedDate, {
        date: selectedDate,
        what_happened: whatHappened,
        what_accomplished: whatAccomplished,
        what_learned: whatLearned,
        what_went_wrong: whatWentWrong,
        tomorrow_priority: tomorrowPriority,
      });
      setHasEntry(true);
      if (onShowToast) onShowToast("Diary entry saved to database.");
    } catch (err) {
      console.error("Failed to save diary:", err);
      if (onShowToast) onShowToast("Error saving diary entry.");
    } finally {
      setSaving(false);
    }
  };

  const totalChars = whatHappened.length + whatAccomplished.length + whatLearned.length + whatWentWrong.length + tomorrowPriority.length;

  return (
    <motion.div className="product-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="product-heading">
        <div className="product-title-icon"><BookOpen size={19} /></div>
        <div>
          <span>PERSONAL RECORD</span>
          <strong>Diary</strong>
          <small>Date-based daily log: what happened, what was learned, and tomorrow's priority.</small>
        </div>
        <span className={`connection-state ${hasEntry ? "state-live" : ""}`}>
          {hasEntry ? "ENTRY SAVED" : "NO ENTRY YET"}
        </span>
      </div>

      <div className="product-tabs">
        {tabs.map((tab) => (
          <button className={tab === activeTab ? "product-tab-active" : ""} onClick={() => setActiveTab(tab)} key={tab}>{tab}</button>
        ))}
      </div>

      <div className="page-metric-row">
        <div className="page-metric metric-0"><span>SELECTED DATE</span><strong>{selectedDate}</strong><small>ACTIVE DATE</small></div>
        <div className="page-metric metric-1"><span>ENTRY STATUS</span><strong>{hasEntry ? "Recorded" : "Draft"}</strong><small>{hasEntry ? "SAVED IN SQLITE" : "UNSAVED"}</small></div>
        <div className="page-metric metric-2"><span>CHARACTERS</span><strong>{totalChars}</strong><small>TOTAL LENGTH</small></div>
        <div className="page-metric metric-0"><span>STORAGE</span><strong>SQLite</strong><small>DIARY_ENTRIES TABLE</small></div>
      </div>

      <div className="page-content-grid">
        <section className="page-primary-panel">
          {activeTab === "Today's Entry" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9" }}>Daily Log · {selectedDate}</span>
                <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", background: "#60e7dc22", border: "1px solid #60e7dc66", color: "#60e7dc", cursor: "pointer", fontSize: "10px", fontWeight: 600 }}>
                  <Save size={12} />{saving ? "Saving..." : "Save Entry"}
                </button>
              </div>
              {loading ? (
                <div style={{ padding: "30px 0", textAlign: "center", color: "#64748b", fontSize: "12px" }}>Loading entry...</div>
              ) : (
                <div className="diary-fields">
                  {[
                    { label: "What happened today?", value: whatHappened, set: setWhatHappened, placeholder: "Key events, meetings, milestones, and factual daily timeline..." },
                    { label: "What did I accomplish?", value: whatAccomplished, set: setWhatAccomplished, placeholder: "Tasks completed, goals hit, outputs delivered..." },
                    { label: "What did I learn?", value: whatLearned, set: setWhatLearned, placeholder: "Technical lessons, insights, observations from today..." },
                    { label: "What went wrong?", value: whatWentWrong, set: setWhatWentWrong, placeholder: "Mistakes, blockers, things to not repeat..." },
                    { label: "Tomorrow's priority", value: tomorrowPriority, set: setTomorrowPriority, placeholder: "The single most important thing to accomplish tomorrow..." },
                  ].map(({ label, value, set, placeholder }) => (
                    <label key={label}>
                      <span>{label}</span>
                      <textarea
                        rows={4}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        placeholder={placeholder}
                      />
                    </label>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "History" && (
            <>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#f1f5f9", marginBottom: "10px" }}>
                Past Diary Entries — {historyDates.length} dates with records
              </div>
              {historyLoading ? (
                <div style={{ padding: "30px 0", textAlign: "center", color: "#64748b", fontSize: "12px" }}>Loading history...</div>
              ) : historyDates.length === 0 ? (
                <div className="page-empty" style={{ minHeight: "140px" }}>
                  <History size={22} />
                  <strong>No history yet</strong>
                  <span>Start logging daily records to build your diary history.</span>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "8px" }}>
                  {historyDates.map((record) => (
                    <button
                      key={record.date}
                      onClick={() => { setSelectedDate(record.date); setActiveTab("Today's Entry"); }}
                      style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "12px", textAlign: "left", cursor: "pointer", width: "100%" }}
                    >
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `rgba(96,231,220,${Math.min(0.6, (record.daily_score || 0) / 100)})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#0a0e1a", flexShrink: 0 }}>
                        {Math.round(record.daily_score || 0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "#e2e8f0" }}>{record.date}</div>
                        {historyPreviews[record.date] ? (
                          <div style={{ fontSize: "10px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                            {historyPreviews[record.date]}...
                          </div>
                        ) : (
                          <div style={{ fontSize: "10px", color: "#334155", marginTop: "2px" }}>No diary entry recorded</div>
                        )}
                      </div>
                      <ChevronRight size={14} style={{ color: "#475569", flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <aside className="page-side-stack">
          <div className="page-side-item">
            <span><CalendarDays size={15} /></span>
            <div><strong>Date Navigation</strong><small>Use the header date control to browse past entries</small></div>
          </div>
          <div className="page-side-item side-1">
            <span><Brain size={15} /></span>
            <div><strong>Mental Clarity</strong><small>Recording daily events prevents ungrounded rumination</small></div>
          </div>
          <div className="page-side-item side-2">
            <span><Clock size={15} /></span>
            <div><strong>History Timeline</strong><small>Switch to History tab to browse and review past entries</small></div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
