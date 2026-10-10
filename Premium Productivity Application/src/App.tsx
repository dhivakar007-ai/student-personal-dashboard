import { Fragment, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  HeartPulse,
  Home,
  ListTodo,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  Target,
  Timer,
  X,
  Zap,
} from "lucide-react";
import {
  godhqApi,
} from "./lib/godhqApi";
import type { ActivityLog, DailyRecord, Goal, Project, Task, WeeklyAnalytics } from "./types";
import { useDate, DateProvider } from "./context/DateContext";
import { formatDateDisplay } from "./lib/dateEngine";
import { DateControl } from "./components/DateControl";
import { ActionModal } from "./components/ActionModal";

// Sub-page screens
import { TodayView } from "./pages/TodayView";
import { ThisWeekView } from "./pages/ThisWeekView";
import { ThisMonthView } from "./pages/ThisMonthView";
import { HabitsAndStreaksView } from "./pages/HabitsAndStreaksView";
import { ProjectsView } from "./pages/ProjectsView";
import { TasksView } from "./pages/TasksView";
import { DiaryView } from "./pages/DiaryView";
import { TimetablePage } from "./pages/TimetablePage";
import { EscapeTimerPage } from "./pages/EscapeTimerPage";
import { SettingsView } from "./pages/SettingsView";

type Accent = "cyan" | "violet" | "coral" | "amber" | "lime";

const navigation = [
  { group: "Primary", label: "Command Center", icon: Home },
  { group: "Primary", label: "Today", icon: CalendarDays },
  { group: "Primary", label: "This Week", icon: BarChart3 },
  { group: "Primary", label: "This Month", icon: CalendarDays },
  { group: "Systems", label: "Habits & Streaks", icon: Flame },
  { group: "Systems", label: "Projects", icon: BriefcaseBusiness },
  { group: "Systems", label: "Tasks", icon: ListTodo },
  { group: "Systems", label: "Diary", icon: BookOpen },
  { group: "Planning", label: "Schedule", icon: Clock3 },
  { group: "Planning", label: "Timer", icon: Timer },
  { group: "Utility", label: "Settings", icon: Settings },
];

const categoryMeta = [
  { name: "Health", key: "health_score", icon: HeartPulse, accent: "coral" as Accent },
  { name: "Brain", key: "brain_score", icon: Brain, accent: "cyan" as Accent },
  { name: "Engineering", key: "engineering_score", icon: Zap, accent: "violet" as Accent },
  { name: "Communication", key: "communication_score", icon: BookOpen, accent: "amber" as Accent },
  { name: "Discipline", key: "discipline_score", icon: Target, accent: "lime" as Accent },
];

const particles = [
  [9, 26, 4, "cyan"],
  [17, 71, 3, "violet"],
  [27, 9, 3, "amber"],
  [31, 85, 4, "coral"],
  [67, 8, 3, "cyan"],
  [79, 20, 5, "violet"],
  [88, 65, 3, "amber"],
  [74, 86, 4, "cyan"],
  [7, 54, 3, "coral"],
  [91, 43, 4, "violet"],
];

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function LiquidButton({
  children,
  accent = "violet",
  active = false,
  compact = false,
  onClick,
  ariaLabel,
  className = "",
}: {
  children: React.ReactNode;
  accent?: Accent;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <motion.button
      aria-label={ariaLabel}
      className={`liquid-button liquid-${accent} ${active ? "is-active" : ""} ${
        compact ? "is-compact" : ""
      } ${className}`}
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

function SectionLabel({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-label">
      <span>{children}</span>
      {action}
    </div>
  );
}

function Sidebar({
  active,
  onChange,
  onShowToast,
}: {
  active: string;
  onChange: (item: string) => void;
  onShowToast: (msg: string) => void;
}) {
  return (
    <aside className="system-bar" aria-label="Primary navigation">
      <div className="system-brand" aria-label="Student Personal Dashboard">
        <img src="/assets/student-dashboard-mark.svg" alt="" />
      </div>
      <nav className="nav-list">
        {navigation.map(({ group, label, icon: Icon }, index) => {
          const isActive = active === label;
          return (
            <Fragment key={label}>
              {(index === 0 || navigation[index - 1].group !== group) && (
                <span className="nav-group-label">{group}</span>
              )}
              <motion.button
                className={`nav-item ${isActive ? "nav-active" : ""}`}
                onClick={() => onChange(label)}
                aria-current={isActive ? "page" : undefined}
                title={label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.025 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="nav-icon">
                  <Icon size={16} strokeWidth={2.1} />
                </span>
                <span>{label}</span>
              </motion.button>
            </Fragment>
          );
        })}
      </nav>
      <button
        className="profile-button"
        aria-label="Open profile"
        onClick={() => onShowToast("Student Dashboard profile: Synced to local storage.")}
      >
        <span>SD</span>
        <i />
      </button>
    </aside>
  );
}

function Header({
  completion,
  dateLabel,
  onShowToast,
}: {
  completion: number;
  dateLabel: string;
  onShowToast: (msg: string) => void;
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <header className="dashboard-header">
      <div>
        <div className="eyebrow">
          <Sparkles size={13} /> STUDENT PERSONAL DASHBOARD
        </div>
        <div className="greeting">{greeting}</div>
        <div className="date-line" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
          <span>{dateLabel}</span>
          <DateControl />
        </div>
      </div>
      <div className="header-metrics">
        <div className="clock-block">
          <span>LOCAL TIME</span>
          <strong>{time}</strong>
        </div>
        <div className="completion-copy">
          <span>DAILY SCORE</span>
          <strong>{completion}%</strong>
        </div>
        <div className="mini-progress" style={{ "--progress": completion } as React.CSSProperties}>
          <span>{completion}%</span>
        </div>
        <button
          className="notification-button"
          aria-label="Command status"
          onClick={() => onShowToast("Notification system: All daily monitors operational.")}
        >
          <Bell size={18} />
          <i />
        </button>
      </div>
    </header>
  );
}

function HabitProgress({ daily }: { daily: DailyRecord | null }) {
  return (
    <motion.section className="light-panel habit-panel" whileHover={{ y: -3 }}>
      <SectionLabel action={<span className="panel-status">5 CATEGORIES</span>}>
        Category performance
      </SectionLabel>
      <div className="habit-list">
        {categoryMeta.map(({ name, key, icon: Icon, accent }) => {
          const score = daily ? Math.round((daily as any)[key] || 0) : 0;
          return (
            <div className="habit-row" key={name}>
              <div className={`habit-symbol symbol-${accent}`}>
                <Icon size={14} />
              </div>
              <div className="habit-data">
                <div className="habit-name">
                  <span>{name}</span>
                  <b>{score}%</b>
                </div>
                <div
                  className={`range range-${accent}`}
                  style={{ "--value": `${score}%` } as React.CSSProperties}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${score}%`,
                      borderRadius: "99px",
                      background: "currentColor",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

function GoalProgress({ goals, onNavigate }: { goals: Goal[]; onNavigate: () => void }) {
  const activeGoals = goals.filter((g) => g.status === "Active");
  const completedGoals = goals.filter((g) => g.status === "Completed");
  const overallAvg =
    activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length)
      : 0;

  return (
    <motion.section className="light-panel goal-panel" whileHover={{ y: -3 }}>
      <SectionLabel action={<span className="trend-positive">{goals.length} TOTAL</span>}>
        Goal progress
      </SectionLabel>
      <div className="goal-topline">
        <div>
          <strong>{overallAvg}%</strong>
          <span>Active progress</span>
        </div>
        <div className="goal-ring">
          <span>
            {completedGoals.length}/{goals.length}
          </span>
        </div>
      </div>
      <div className="bar-stage">
        {activeGoals.slice(0, 4).map((g, index) => {
          const prog = clampPercent(Math.round(g.progress || 0));
          return (
            <motion.div
              className={`goal-bar bar-${index % 4}`}
              initial={{ height: 8 }}
              animate={{ height: `${Math.max(12, prog)}%` }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
              key={g.id}
              title={`${g.title}: ${prog}%`}
            >
              <span>{prog}%</span>
            </motion.div>
          );
        })}
        {activeGoals.length === 0 && (
          <div style={{ fontSize: "10px", color: "#64748b", alignSelf: "center", marginBottom: "14px" }}>
            No active goals. Add goals in Projects/Goals view.
          </div>
        )}
      </div>
      <div className="chart-caption">
        <button
          onClick={onNavigate}
          style={{ background: "none", border: "none", color: "#7493ff", cursor: "pointer", fontSize: "10px", padding: 0 }}
        >
          View all goals →
        </button>
      </div>
    </motion.section>
  );
}

function DailyCore({
  daily,
  onNavigateToday,
}: {
  daily: DailyRecord | null;
  onNavigateToday: () => void;
}) {
  const score = daily ? Math.round(daily.daily_score || 0) : 0;
  const codingMins = daily?.coding_min || 0;
  const tasksDone = daily?.mit_completed ? 1 : 0;

  return (
    <section className="core-section">
      <div className="core-title">
        <div>
          <span>Daily momentum</span>
          <small>Interactive scoring engine</small>
        </div>
        <div className="live-pill">
          <i /> LIVE
        </div>
      </div>
      <div className="orbit-wrap">
        {particles.map(([left, top, size, color], index) => (
          <motion.i
            className={`particle particle-${color}`}
            key={index}
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
            animate={{ y: [0, -6, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.4 + index * 0.12, repeat: Infinity, delay: index * 0.13 }}
          />
        ))}
        <motion.div
          className="orbit-system"
          animate={{ rotateX: [10, 13, 10], rotateY: [-7, 7, -7] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="orbit-shadow" />
          <motion.div
            className="orbit orbit-outer"
            animate={{ rotate: 360 }}
            transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
          >
            <i />
            <i />
            <i />
          </motion.div>
          <motion.div
            className="orbit orbit-mid"
            animate={{ rotate: -360 }}
            transition={{ duration: 23, repeat: Infinity, ease: "linear" }}
          >
            <i />
            <i />
          </motion.div>
          <motion.div
            className="orbit orbit-inner"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          >
            <i />
            <i />
          </motion.div>
          <div className="core-halo" style={{ "--progress": score } as React.CSSProperties} />
          <button
            className="core-button"
            onClick={onNavigateToday}
            aria-label="Open today's checklist"
            title="Open Today Checklist"
          >
            <span>{score}</span>
            <small>%</small>
            <em>SCORE</em>
          </button>
        </motion.div>
        <div className="orbit-stat orbit-stat-left">
          <Check size={12} /> {tasksDone} MIT
        </div>
        <div className="orbit-stat orbit-stat-right">
          <Zap size={12} /> {codingMins}m code
        </div>
      </div>
      <div className="core-controls">
        <span>Click core to record today's habits & metrics</span>
        <button
          onClick={onNavigateToday}
          style={{ width: "auto", padding: "0 8px" }}
          aria-label="Navigate to Today"
        >
          Open Today →
        </button>
      </div>
    </section>
  );
}

function TaskProgress({
  tasks,
  onCompleteNext,
  onCreateTask,
}: {
  tasks: Task[];
  onCompleteNext: () => void;
  onCreateTask: () => void;
}) {
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const total = tasks.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.section className="light-panel task-panel" whileHover={{ y: -3 }}>
      <SectionLabel action={<CheckCircle2 size={16} />}>Task progress</SectionLabel>
      <div className="task-count">
        <strong>{completed}</strong>
        <span>/{total}</span>
      </div>
      <div className="task-track">
        <motion.span animate={{ width: `${percent}%` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {total > completed ? (
          <button className="text-action" onClick={onCompleteNext}>
            Complete next <ChevronRight size={13} />
          </button>
        ) : (
          <span style={{ fontSize: "9px", color: "#64748b", marginTop: "8px" }}>
            {total === 0 ? "No tasks for today" : "All tasks complete!"}
          </span>
        )}
        <button
          onClick={onCreateTask}
          style={{ background: "none", border: "none", color: "#6366f1", fontSize: "10px", cursor: "pointer", marginTop: "8px" }}
        >
          + Add
        </button>
      </div>
    </motion.section>
  );
}

function FocusTimer({
  compact = false,
  onSessionComplete,
}: {
  compact?: boolean;
  onSessionComplete: (durationMinutes: number) => void;
}) {
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    if (running) {
      timer = window.setInterval(() => {
        setRemaining((val) => {
          if (val <= 1) {
            setRunning(false);
            onSessionComplete(25);
            return 25 * 60;
          }
          return val - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [running, onSessionComplete]);

  return (
    <motion.section className={`focus-panel ${compact ? "compact-focus" : ""}`} layout>
      <div className="focus-meta">
        <span>FOCUS SESSION</span>
        <i className={running ? "focus-live" : ""}>{running ? "IN FLOW" : "READY"}</i>
      </div>
      <div className="focus-time">{formatTime(remaining)}</div>
      <div className="focus-actions">
        <LiquidButton
          accent="violet"
          compact
          onClick={() => setRunning((v) => !v)}
          ariaLabel={running ? "Pause focus" : "Start focus"}
        >
          {running ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
          {running ? "Pause" : "Start focus"}
        </LiquidButton>
        <button
          aria-label="Reset timer"
          className="icon-button"
          onClick={() => {
            setRunning(false);
            setRemaining(25 * 60);
          }}
        >
          <RefreshCw size={15} />
        </button>
      </div>
    </motion.section>
  );
}

function Timeline({
  activities,
  tasks,
}: {
  activities: ActivityLog[];
  tasks: Task[];
}) {
  return (
    <section className="timeline-panel">
      <SectionLabel action={<span className="timeline-date">DAILY FEED ({activities.length + tasks.length})</span>}>
        Activity & execution timeline
      </SectionLabel>
      <div style={{ marginTop: "12px", display: "grid", gap: "8px", maxHeight: "120px", overflowY: "auto" }}>
        {activities.length === 0 && tasks.length === 0 ? (
          <div style={{ fontSize: "10px", color: "#64748b", padding: "12px 0", textAlign: "center" }}>
            No recorded activities or tasks yet today.
          </div>
        ) : (
          [...activities.map((a) => ({ id: `act-${a.id}`, title: a.activity, type: a.category, sub: `${a.duration_min || 0}m` })),
           ...tasks.map((t) => ({ id: `task-${t.id}`, title: t.title, type: t.category, sub: t.status }))]
            .slice(0, 5)
            .map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "10px",
                  padding: "6px 10px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                }}
              >
                <span style={{ color: "#e2e8f0" }}>{item.title}</span>
                <span style={{ color: "#94a3b8", fontSize: "9px" }}>{item.type} · {item.sub}</span>
              </div>
            ))
        )}
      </div>
    </section>
  );
}

function ActivityStack({
  tasks,
  activities,
  daily,
  onNavigate,
}: {
  tasks: Task[];
  activities: ActivityLog[];
  daily: DailyRecord | null;
  onNavigate: (tab: string) => void;
}) {
  const pendingTasks = tasks.filter((t) => t.status !== "Completed");

  return (
    <aside className="activity-stack">
      <div className="activity-heading">
        <div>
          <span>ACTIONS</span>
          <strong>Pending ({pendingTasks.length})</strong>
        </div>
        <button aria-label="Open tasks" onClick={() => onNavigate("Tasks")}>
          <ListTodo size={17} />
        </button>
      </div>
      <div className="reminder-list">
        {pendingTasks.slice(0, 3).map((t) => (
          <div className="reminder" key={t.id}>
            <i className="reminder-dot dot-coral" />
            <div>
              <strong>{t.title}</strong>
              <span>{t.priority} · {t.category}</span>
            </div>
          </div>
        ))}
        {pendingTasks.length === 0 && (
          <div className="all-clear">
            <Check size={14} /> All clear for today
          </div>
        )}
      </div>
      <div className="activity-divider" />
      <SectionLabel action={<button className="view-all" onClick={() => onNavigate("Today")}>View Today</button>}>
        Category Status
      </SectionLabel>
      <div className="recent-list">
        <div className="recent-item">
          <span className="recent-icon cyan-icon">
            <Zap size={14} />
          </span>
          <div>
            <strong>Engineering</strong>
            <small>{daily?.coding_min || 0}m coding logged</small>
          </div>
        </div>
        <div className="recent-item">
          <span className="recent-icon amber-icon">
            <Brain size={14} />
          </span>
          <div>
            <strong>DSA Practice</strong>
            <small>{daily?.dsa_problems || 0} problems solved</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

function QuickDock({ onAction }: { onAction: (label: string) => void }) {
  const actions = [
    { label: "New Task", icon: Plus, accent: "coral" as Accent },
    { label: "Log Time", icon: Clock3, accent: "cyan" as Accent },
    { label: "Quick Note", icon: BookOpen, accent: "amber" as Accent },
  ];
  return (
    <div className="quick-dock" aria-label="Quick actions">
      <div className="dock-label">QUICK ACTIONS</div>
      {actions.map(({ label, icon: Icon, accent }) => (
        <LiquidButton key={label} accent={accent} compact onClick={() => onAction(label)}>
          <Icon size={15} /> <span>{label}</span>
        </LiquidButton>
      ))}
      <div className="keyboard-hint">
        <span>⌘</span>
        <span>K</span>
      </div>
    </div>
  );
}

function MainAppContent() {
  const { selectedDate } = useDate();
  const [activeNav, setActiveNav] = useState("Command Center");
  const [dailyRecord, setDailyRecord] = useState<DailyRecord | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"task" | "time" | "note" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const loadData = async () => {
    try {
      const [dRes, tRes, aRes, gRes, wRes] = await Promise.allSettled([
        godhqApi.daily.get(selectedDate),
        godhqApi.tasks.list({ date: selectedDate }),
        godhqApi.activities.list(selectedDate),
        godhqApi.growth.getGoals(),
        godhqApi.analytics.getWeekly(selectedDate),
      ]);

      if (dRes.status === "fulfilled") setDailyRecord(dRes.value);
      if (tRes.status === "fulfilled") setTasks(tRes.value);
      if (aRes.status === "fulfilled") setActivities(aRes.value);
      if (gRes.status === "fulfilled") setGoals(gRes.value);
      if (wRes.status === "fulfilled") setWeekly(wRes.value);
    } catch (err) {
      console.error("Failed to load initial data:", err);
      setError("Unable to connect to the Student Dashboard API. Ensure the backend is running.");
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleAdvanceTask = async () => {
    const nextTask = tasks.find((t) => t.status !== "Completed");
    if (!nextTask) return;
    try {
      const updated = await godhqApi.tasks.update(nextTask.id, { status: "Completed" });
      setTasks((prev) => prev.map((t) => (t.id === nextTask.id ? updated : t)));
      showToast(`Task '${nextTask.title}' marked completed`);
    } catch (err) {
      console.error("Failed to advance task:", err);
    }
  };

  const handleQuickAction = (label: string) => {
    if (label === "New Task") setActiveModal("task");
    if (label === "Log Time") setActiveModal("time");
    if (label === "Quick Note") setActiveModal("note");
  };

  const handleCreateTask = async (title: string, priority: "P1" | "P2" | "P3", category: string) => {
    try {
      const created = await godhqApi.tasks.create({
        title,
        priority,
        category,
        date: selectedDate,
        status: "Planned",
      });
      setTasks((prev) => [created, ...prev]);
      showToast("Task created successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleLogTime = async (activity: string, category: string, durationMin: number) => {
    try {
      const created = await godhqApi.activities.create({
        activity,
        category,
        duration_min: durationMin,
        date: selectedDate,
        start_time: new Date().toTimeString().slice(0, 5),
        end_time: new Date().toTimeString().slice(0, 5),
        description: "",
        related_project: "",
      });
      setActivities((prev) => [created, ...prev]);
      showToast("Time logged successfully");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to log time:", err);
    }
  };

  const handleSaveNote = async (title: string, content: string) => {
    try {
      await godhqApi.diary.update(selectedDate, { what_happened: content || title, date: selectedDate });
      showToast("Note recorded in diary");
      setActiveModal(null);
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const handleFocusComplete = async (durationMinutes: number) => {
    try {
      const act = await godhqApi.activities.create({
        date: selectedDate,
        activity: "Focus Session",
        category: "Engineering",
        duration_min: durationMinutes,
        start_time: new Date().toTimeString().slice(0, 5),
        end_time: new Date().toTimeString().slice(0, 5),
        description: "Focus timer session",
        related_project: "",
      });
      setActivities((prev) => [act, ...prev]);
      showToast(`Logged ${durationMinutes}m focus session`);
    } catch (err) {
      console.error("Failed to log focus session:", err);
    }
  };

  const completionValue = dailyRecord ? clampPercent(Math.round(dailyRecord.daily_score || 0)) : 0;
  const weekSummary = weekly ? `${weekly.days_tracked || 0} tracked days` : "Waiting for data";

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="desktop-frame">
        <Sidebar active={activeNav} onChange={(item) => setActiveNav(item)} onShowToast={showToast} />
        <motion.div
          className="dashboard"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Header
            completion={completionValue}
            dateLabel={formatDateDisplay(selectedDate)}
            onShowToast={showToast}
          />

          {error && (
            <div className="toast" style={{ position: "static", marginBottom: 16, width: "fit-content", maxWidth: 600 }}>
              <CheckCircle2 size={16} /> {error}
            </div>
          )}

          {activeNav === "Command Center" && (
            <div className="dashboard-grid">
              <div className="left-metrics">
                <HabitProgress daily={dailyRecord} />
                <GoalProgress goals={goals} onNavigate={() => setActiveNav("Projects")} />
                <div className="habit-summary">
                  <span>7-Day Summary</span>
                  <strong>{dailyRecord?.daily_score ? `${Math.round(dailyRecord.daily_score)}%` : "0%"}</strong>
                  <i>{weekSummary}</i>
                </div>
              </div>
              <div className="center-stage">
                <DailyCore daily={dailyRecord} onNavigateToday={() => setActiveNav("Today")} />
                <div className="center-lower">
                  <FocusTimer onSessionComplete={handleFocusComplete} />
                  <div className="energy-card">
                    <div>
                      <span>STATUS</span>
                      <strong>{dailyRecord?.status || "NOT STARTED"}</strong>
                    </div>
                    <Zap size={22} fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="right-metrics">
                <TaskProgress
                  tasks={tasks}
                  onCompleteNext={handleAdvanceTask}
                  onCreateTask={() => setActiveModal("task")}
                />
                <FocusTimer compact onSessionComplete={handleFocusComplete} />
              </div>
              <ActivityStack
                tasks={tasks}
                activities={activities}
                daily={dailyRecord}
                onNavigate={setActiveNav}
              />
              <Timeline activities={activities} tasks={tasks} />
            </div>
          )}

          {activeNav === "Today" && <TodayView />}
          {activeNav === "This Week" && <ThisWeekView />}
          {activeNav === "This Month" && <ThisMonthView />}
          {activeNav === "Habits & Streaks" && <HabitsAndStreaksView />}
          {activeNav === "Projects" && <ProjectsView />}
          {activeNav === "Tasks" && <TasksView />}
          {activeNav === "Diary" && <DiaryView onShowToast={showToast} />}
          {activeNav === "Schedule" && <TimetablePage />}
          {activeNav === "Timer" && <EscapeTimerPage onSessionLogged={handleFocusComplete} />}
          {activeNav === "Settings" && <SettingsView onShowToast={showToast} />}

          <QuickDock onAction={handleQuickAction} />
        </motion.div>
      </div>

      <ActionModal
        type={activeModal}
        onClose={() => setActiveModal(null)}
        onSubmitTask={handleCreateTask}
        onSubmitTime={handleLogTime}
        onSubmitNote={handleSaveNote}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
          >
            <CheckCircle2 size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function App() {
  return (
    <DateProvider>
      <MainAppContent />
    </DateProvider>
  );
}
