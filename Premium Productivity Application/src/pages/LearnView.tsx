import React, { useState, useEffect } from "react";
import { Plus, Code2, Mic, Binary, Trash2, CheckCircle2 } from "lucide-react";
import { dsaApi, commApi } from "../lib/godhqApi";
import type { DSAEntry, CommunicationEntry } from "../types";
import { useDate } from "../context/DateContext";

export const LearnView: React.FC = () => {
  const { selectedDate } = useDate();
  const [activeTab, setActiveTab] = useState<"DSA" | "Comm">("DSA");
  const [dsaList, setDsaList] = useState<DSAEntry[]>([]);
  const [commList, setCommList] = useState<CommunicationEntry[]>([]);
  const [dsaStats, setDsaStats] = useState<{ total: number; easy: number; medium: number; hard: number } | null>(null);

  // New DSA form
  const [isAddingDsa, setIsAddingDsa] = useState(false);
  const [problem, setProblem] = useState("");
  const [platform, setPlatform] = useState("LeetCode");
  const [difficulty, setDifficulty] = useState("Medium");
  const [topic, setTopic] = useState("Arrays");
  const [timeSpent, setTimeSpent] = useState(30);

  // New Comm form
  const [isAddingComm, setIsAddingComm] = useState(false);
  const [commTopic, setCommTopic] = useState("");
  const [commType, setCommType] = useState("JAM");
  const [commDuration, setCommDuration] = useState(15);

  const loadData = async () => {
    try {
      const [dsaData, commData, stats] = await Promise.all([
        dsaApi.list(),
        commApi.list(),
        dsaApi.stats(),
      ]);
      setDsaList(dsaData);
      setCommList(commData);
      setDsaStats(stats);
    } catch (err) {
      console.error("Failed to load learning records:", err);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreateDsa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;

    try {
      const created = await dsaApi.create({
        problem: problem.trim(),
        platform,
        difficulty,
        topic,
        time_spent_min: timeSpent,
        date: selectedDate,
        solved: true,
      });
      setDsaList((prev) => [created, ...prev]);
      setProblem("");
      setIsAddingDsa(false);
      void dsaApi.stats().then(setDsaStats);
    } catch (err) {
      console.error("Failed to create DSA problem:", err);
    }
  };

  const handleCreateComm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commTopic.trim()) return;

    try {
      const created = await commApi.create({
        topic: commTopic.trim(),
        type: commType,
        duration_min: commDuration,
        date: selectedDate,
        confidence: 4,
      });
      setCommList((prev) => [created, ...prev]);
      setCommTopic("");
      setIsAddingComm(false);
    } catch (err) {
      console.error("Failed to create communication entry:", err);
    }
  };

  const handleDeleteDsa = async (id: number) => {
    try {
      await dsaApi.delete(id);
      setDsaList((prev) => prev.filter((d) => d.id !== id));
      void dsaApi.stats().then(setDsaStats);
    } catch (err) {
      console.error("Failed to delete DSA problem:", err);
    }
  };

  const handleDeleteComm = async (id: number) => {
    try {
      await commApi.delete(id);
      setCommList((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete communication entry:", err);
    }
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Tab bar header */}
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
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Learning & Deliberate Practice</h2>
          <p style={{ fontSize: "10px", color: "#8a96ad", margin: "4px 0 0" }}>
            Data Structures & Algorithms and Executive Communication drills
          </p>
        </div>

        <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.04)", borderRadius: "10px", padding: "3px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
          <button
            onClick={() => setActiveTab("DSA")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: activeTab === "DSA" ? 700 : 500,
              background: activeTab === "DSA" ? "linear-gradient(135deg, rgba(101, 229, 255, 0.25), rgba(126, 140, 255, 0.25))" : "transparent",
              color: activeTab === "DSA" ? "#65e5ff" : "#94a3b8",
              border: activeTab === "DSA" ? "1px solid rgba(101, 229, 255, 0.3)" : "none",
              cursor: "pointer",
            }}
          >
            Data Structures & Algorithms
          </button>
          <button
            onClick={() => setActiveTab("Comm")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: activeTab === "Comm" ? 700 : 500,
              background: activeTab === "Comm" ? "linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(249, 115, 22, 0.25))" : "transparent",
              color: activeTab === "Comm" ? "#fbbf24" : "#94a3b8",
              border: activeTab === "Comm" ? "1px solid rgba(251, 191, 36, 0.3)" : "none",
              cursor: "pointer",
            }}
          >
            Communication & Voice
          </button>
        </div>
      </div>

      {activeTab === "DSA" ? (
        <div style={{ display: "grid", gap: "16px" }}>
          {/* DSA Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
            <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ fontSize: "10px", color: "#8a96ad" }}>Total Solved</span>
              <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#65e5ff", marginTop: "4px" }}>
                {dsaStats?.total ?? 0}
              </div>
            </div>
            <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ fontSize: "10px", color: "#8a96ad" }}>Easy</span>
              <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#34d399", marginTop: "4px" }}>
                {dsaStats?.easy ?? 0}
              </div>
            </div>
            <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ fontSize: "10px", color: "#8a96ad" }}>Medium</span>
              <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#fbbf24", marginTop: "4px" }}>
                {dsaStats?.medium ?? 0}
              </div>
            </div>
            <div style={{ padding: "14px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ fontSize: "10px", color: "#8a96ad" }}>Hard</span>
              <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "monospace", color: "#ff7180", marginTop: "4px" }}>
                {dsaStats?.hard ?? 0}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setIsAddingDsa(!isAddingDsa)}
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
                border: "none",
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
              <span>Log Problem</span>
            </button>
          </div>

          {isAddingDsa && (
            <form onSubmit={handleCreateDsa} style={{ padding: "16px", borderRadius: "20px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.1)", display: "grid", gap: "10px" }}>
              <input
                type="text"
                placeholder="Problem name (e.g. 200. Number of Islands)..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", fontSize: "12px" }}
                required
              />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ padding: "8px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: "11px" }}>
                  <option value="LeetCode">LeetCode</option>
                  <option value="Codeforces">Codeforces</option>
                  <option value="NeetCode">NeetCode</option>
                  <option value="HackerRank">HackerRank</option>
                </select>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ padding: "8px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: "11px" }}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <input
                  type="text"
                  placeholder="Topic (e.g. Graphs, DP)..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{ padding: "8px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: "11px" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" onClick={() => setIsAddingDsa(false)} style={{ padding: "6px 12px", background: "transparent", color: "#94a3b8", border: "none", cursor: "pointer", fontSize: "11px" }}>Cancel</button>
                <button type="submit" style={{ padding: "6px 14px", borderRadius: "8px", background: "#65e5ff", color: "#0f172a", fontWeight: 600, border: "none", cursor: "pointer", fontSize: "11px" }}>Save Problem</button>
              </div>
            </form>
          )}

          {/* DSA List */}
          <div style={{ borderRadius: "24px", padding: "20px", background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            {dsaList.length === 0 ? (
              <p style={{ textAlign: "center", color: "#64748b", fontSize: "11px", margin: "20px 0" }}>No DSA problems logged yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {dsaList.map((d) => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#f1f5f9" }}>{d.problem}</span>
                      <div style={{ display: "flex", gap: "8px", marginTop: "2px", fontSize: "9px" }}>
                        <span style={{ color: d.difficulty === "Hard" ? "#ff7180" : d.difficulty === "Medium" ? "#fbbf24" : "#34d399", fontWeight: 700 }}>{d.difficulty}</span>
                        <span style={{ color: "#64748b" }}>•</span>
                        <span style={{ color: "#94a3b8" }}>{d.platform}</span>
                        <span style={{ color: "#64748b" }}>•</span>
                        <span style={{ color: "#64748b" }}>{d.topic}</span>
                        <span style={{ color: "#64748b" }}>•</span>
                        <span style={{ color: "#7de9f2", fontFamily: "monospace" }}>{d.date}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteDsa(d.id)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {/* Comm List */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setIsAddingComm(!isAddingComm)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "10px", background: "linear-gradient(135deg, #7855d7, #5b42c5)", color: "#ffffff", fontSize: "11px", fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              <Plus size={14} /> <span>Log Session</span>
            </button>
          </div>

          {isAddingComm && (
            <form onSubmit={handleCreateComm} style={{ padding: "16px", borderRadius: "20px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.1)", display: "grid", gap: "10px" }}>
              <input
                type="text"
                placeholder="Topic / Speaking Drill..."
                value={commTopic}
                onChange={(e) => setCommTopic(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", fontSize: "12px" }}
                required
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <select value={commType} onChange={(e) => setCommType(e.target.value)} style={{ padding: "8px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: "11px" }}>
                  <option value="JAM">JAM (Just A Minute)</option>
                  <option value="Voice Modulation">Voice Modulation</option>
                  <option value="Tech Presentation">Tech Presentation</option>
                  <option value="Debate / Interview">Debate / Interview</option>
                </select>
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={commDuration}
                  onChange={(e) => setCommDuration(Number(e.target.value))}
                  style={{ padding: "8px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: "11px" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" onClick={() => setIsAddingComm(false)} style={{ padding: "6px 12px", background: "transparent", color: "#94a3b8", border: "none", cursor: "pointer", fontSize: "11px" }}>Cancel</button>
                <button type="submit" style={{ padding: "6px 14px", borderRadius: "8px", background: "#fbbf24", color: "#0f172a", fontWeight: 600, border: "none", cursor: "pointer", fontSize: "11px" }}>Save Session</button>
              </div>
            </form>
          )}

          <div style={{ borderRadius: "24px", padding: "20px", background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            {commList.length === 0 ? (
              <p style={{ textAlign: "center", color: "#64748b", fontSize: "11px", margin: "20px 0" }}>No communication drills logged yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {commList.map((c) => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#f1f5f9" }}>{c.topic}</span>
                      <div style={{ display: "flex", gap: "8px", marginTop: "2px", fontSize: "9px" }}>
                        <span style={{ color: "#fbbf24", fontWeight: 700 }}>{c.type}</span>
                        <span style={{ color: "#64748b" }}>•</span>
                        <span style={{ color: "#94a3b8" }}>{c.duration_min} minutes</span>
                        <span style={{ color: "#64748b" }}>•</span>
                        <span style={{ color: "#7de9f2", fontFamily: "monospace" }}>{c.date}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteComm(c.id)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
