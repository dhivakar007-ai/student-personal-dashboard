import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, Clock3, Play, Pause, RefreshCw, BarChart3, CalendarDays, TrendingUp } from "lucide-react";
import { activitiesApi } from "../lib/godhqApi";
import { useDate } from "../context/DateContext";

type Accent = "cyan" | "violet" | "coral" | "amber" | "lime";

function LiquidButton({
  children,
  accent = "violet",
  compact = false,
  onClick,
  ariaLabel,
  className = "",
}: {
  children: React.ReactNode;
  accent?: Accent;
  compact?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <motion.button
      aria-label={ariaLabel}
      className={`liquid-button liquid-${accent} ${compact ? "is-compact" : ""} ${className}`}
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.025 }}
      whileTap={{ y: 1, scale: 0.965 }}
      transition={{ type: "spring", stiffness: 460, damping: 24 }}
    >
      <span className="liquid-shine" />
      <span className="liquid-content">{children}</span>
    </motion.button>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getTimerPrefs() {
  try { return JSON.parse(localStorage.getItem("godhq_timer_prefs") || "{}"); } catch { return {}; }
}

export function EscapeTimerPage({ onSessionLogged }: { onSessionLogged?: (durationMinutes: number) => void }) {
  const { selectedDate } = useDate();
  const modes = ["Focus", "Short Break", "Long Break", "Custom"];
  const [mode, setMode] = useState("Focus");
  const prefs = getTimerPrefs();
  const [duration, setDuration] = useState(( prefs.focusDur ?? 25) * 60);
  const [remaining, setRemaining] = useState((prefs.focusDur ?? 25) * 60);
  const [running, setRunning] = useState(false);
  const [todaySessions, setTodaySessions] = useState<{ id: number; title: string; time: string; minutes: number }[]>([]);

  useEffect(() => {
    const p = getTimerPrefs();
    let secs = (p.focusDur ?? 25) * 60;
    if (mode === "Short Break") secs = (p.shortBreak ?? 5) * 60;
    else if (mode === "Long Break") secs = (p.longBreak ?? 15) * 60;
    else if (mode === "Custom") secs = 45 * 60;
    setDuration(secs);
    setRemaining(secs);
    setRunning(false);
  }, [mode]);

  useEffect(() => {
    let interval: number | undefined;
    if (running) {
      interval = window.setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setRunning(false);
            handleComplete();
            return duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running, duration]);

  const handleComplete = async () => {
    const elapsedMinutes = Math.max(1, Math.round((duration - remaining) / 60) || Math.round(duration / 60));
    try {
      await activitiesApi.create({
        date: selectedDate,
        activity: `${mode} Session`,
        category: mode === "Focus" ? "Engineering" : "Health",
        duration_min: elapsedMinutes,
        start_time: new Date().toTimeString().slice(0, 5),
        end_time: new Date().toTimeString().slice(0, 5),
        description: `${mode} timer session — ${elapsedMinutes} minutes`,
        related_project: "",
      });
      setTodaySessions((prev) => [
        { id: Date.now(), title: `${mode} session completed`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), minutes: elapsedMinutes },
        ...prev,
      ]);
      if (onSessionLogged) {
        onSessionLogged(elapsedMinutes);
      }
    } catch (err) {
      console.error("Failed to log focus timer session:", err);
    }
  };

  const handleReset = () => {
    setRunning(false);
    setRemaining(duration);
  };

  return (
    <div className="timer-shell">
      <div className="product-heading">
        <div className="product-title-icon"><Timer size={19} /></div>
        <div>
          <span>TIME IS THE WATER · FOCUS IS THE ESCAPE</span>
          <strong>Timer</strong>
          <small>Dedicated focus sessions connected directly to your Daily Activity Log.</small>
        </div>
        <span className="connection-state state-live">LIVE FOCUS ENGINE</span>
      </div>

      <div className="product-tabs timer-modes">
        {modes.map((item) => (
          <button
            className={item === mode ? "product-tab-active" : ""}
            onClick={() => setMode(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="timer-structure">
        <div className="timer-ready-state">
          <Timer size={32} />
          <span>{mode.toUpperCase()} SESSION</span>
          <strong>{formatTime(remaining)}</strong>
          <p>
            {running ? "Session in progress. Stay in the zone." : "Select your mode and initiate focus to log verifiable deep work sessions."}
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", gridColumn: "1 / -1", margin: "14px 0" }}>
            <LiquidButton
              accent="violet"
              onClick={() => setRunning((prev) => !prev)}
              ariaLabel={running ? "Pause timer" : "Start timer"}
            >
              {running ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              <span>{running ? "Pause" : "Start"}</span>
            </LiquidButton>
            <button
              onClick={handleReset}
              className="icon-button"
              aria-label="Reset timer"
              style={{ width: "38px", height: "38px", borderRadius: "12px" }}
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div><small>SESSION STATUS</small><b>{running ? "Active · In Flow" : "Ready"}</b></div>
          <div><small>CONFIGURED DURATION</small><b>{Math.round(duration / 60)} minutes</b></div>
        </div>

        <aside className="page-side-stack timer-history">
          <div className="page-side-item">
            <span><Clock3 size={15} /></span>
            <div>
              <strong>Today's sessions</strong>
              <small>{todaySessions.length > 0 ? `${todaySessions.length} recorded this session` : "No sessions completed yet today"}</small>
            </div>
          </div>
          <div className="page-side-item">
            <span><BarChart3 size={15} /></span>
            <div>
              <strong>Weekly target</strong>
              <small>Connects to Focus category metrics</small>
            </div>
          </div>
          <div className="page-side-item">
            <span><CalendarDays size={15} /></span>
            <div>
              <strong>Daily log integration</strong>
              <small>Saved to activity logs automatically</small>
            </div>
          </div>
          <div className="page-side-item">
            <span><TrendingUp size={15} /></span>
            <div>
              <strong>Focus momentum</strong>
              <small>Deep work directly increases Daily Score</small>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
