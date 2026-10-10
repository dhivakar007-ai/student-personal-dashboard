import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Trash2, CheckCircle2, Calendar, Edit2, X, AlertTriangle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Category =
  | 'Engineering'
  | 'Study'
  | 'DSA'
  | 'Communication'
  | 'Health'
  | 'Personal'
  | 'Break';

type ScheduleItem = {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  day: number;       // 0 = Mon … 6 = Sun
  category: Category;
  notes: string;
  completed: boolean;
  completedAt?: string; // ISO string
};

type View = 'daily' | 'weekly';

const STORAGE_KEY = 'godhq_schedule';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CATEGORIES: Category[] = [
  'Engineering',
  'Study',
  'DSA',
  'Communication',
  'Health',
  'Personal',
  'Break',
];

const CATEGORY_COLORS: Record<Category, { border: string; bg: string; text: string }> = {
  Engineering:   { border: '#7a7cf8', bg: 'rgba(122,124,248,.13)', text: '#9b9dff' },
  Study:         { border: '#60e7dc', bg: 'rgba(96,231,220,.1)',   text: '#60e7dc' },
  DSA:           { border: '#f0a94e', bg: 'rgba(240,169,78,.1)',   text: '#f0bc72' },
  Communication: { border: '#c480f5', bg: 'rgba(196,128,245,.1)',  text: '#d09dfa' },
  Health:        { border: '#58e09a', bg: 'rgba(88,224,154,.1)',   text: '#72e8ab' },
  Personal:      { border: '#f06688', bg: 'rgba(240,102,136,.1)',  text: '#f48aaa' },
  Break:         { border: '#8ea3bf', bg: 'rgba(142,163,191,.08)', text: '#a4b7ce' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genId(): string {
  return `${Date.now()}-${Math.floor(performance.now() * 1000)}`;
}

function loadItems(): ScheduleItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScheduleItem[]) : [];
  } catch {
    return [];
  }
}

function saveItems(items: ScheduleItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function todayDayIndex(): number {
  // JS getDay(): 0=Sun…6=Sat → convert to Mon=0…Sun=6
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function parseMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatDuration(start: string, end: string): string {
  const diff = parseMinutes(end) - parseMinutes(start);
  if (diff <= 0) return '';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ─── Blank form state ─────────────────────────────────────────────────────────

type FormState = {
  title: string;
  startTime: string;
  endTime: string;
  day: number;
  category: Category;
  notes: string;
};

const BLANK_FORM: FormState = {
  title: '',
  startTime: '09:00',
  endTime: '10:00',
  day: todayDayIndex(),
  category: 'Engineering',
  notes: '',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryBadge({ cat }: { cat: Category }) {
  const c = CATEGORY_COLORS[cat];
  return (
    <span
      style={{
        fontSize: '6px',
        fontWeight: 700,
        letterSpacing: '.1em',
        padding: '2px 6px',
        borderRadius: '5px',
        border: `1px solid ${c.border}44`,
        background: c.bg,
        color: c.text,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {cat}
    </span>
  );
}

function ItemCard({
  item,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: ScheduleItem;
  onToggle: (id: string) => void;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (id: string) => void;
}) {
  const c = CATEGORY_COLORS[item.category];
  const duration = formatDuration(item.startTime, item.endTime);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'center',
        gap: '9px',
        padding: '9px 11px',
        marginBottom: '7px',
        borderRadius: '12px',
        border: `1px solid ${c.border}33`,
        borderLeft: `3px solid ${c.border}`,
        background: item.completed
          ? 'rgba(255,255,255,.018)'
          : c.bg,
        opacity: item.completed ? 0.58 : 1,
        transition: 'opacity .2s',
      }}
    >
      {/* Toggle */}
      <button
        onClick={() => onToggle(item.id)}
        title={item.completed ? 'Mark incomplete' : 'Mark complete'}
        style={{
          border: 0,
          background: 'transparent',
          cursor: 'pointer',
          color: item.completed ? '#60e7dc' : '#4d5a70',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <CheckCircle2 size={15} />
      </button>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
          <strong
            style={{
              fontSize: '9px',
              fontWeight: 600,
              color: item.completed ? '#6a7588' : '#d9e0ed',
              textDecoration: item.completed ? 'line-through' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.title}
          </strong>
          <CategoryBadge cat={item.category} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
          <Clock size={9} color="#59677e" />
          <span style={{ fontSize: '7px', color: '#59677e' }}>
            {item.startTime}–{item.endTime}
            {duration ? ` · ${duration}` : ''}
          </span>
          {item.notes && (
            <span
              style={{
                fontSize: '7px',
                color: '#59677e',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '180px',
              }}
            >
              · {item.notes}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => onEdit(item)}
          title="Edit"
          style={{
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            color: '#59677e',
            padding: '3px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          title="Delete"
          style={{
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            color: '#8a4f5e',
            padding: '3px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
}

function InlineForm({
  initial,
  editingItem,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: FormState;
  editingItem: ScheduleItem | null;
  onSave: (data: FormState) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (parseMinutes(form.endTime) <= parseMinutes(form.startTime)) return;
    onSave(form);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '7px 9px',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '8px',
    outline: 0,
    color: '#d9dfeb',
    background: '#111626',
    fontSize: '8px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'grid',
    gap: '4px',
    color: '#6b7891',
    fontSize: '7px',
    fontWeight: 600,
    letterSpacing: '.06em',
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      onSubmit={handleSubmit}
      style={{
        padding: '14px',
        margin: '8px 0',
        borderRadius: '14px',
        border: '1px solid rgba(96,231,220,.15)',
        background: 'rgba(96,231,220,.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '8px', fontWeight: 700, color: '#60e7dc', letterSpacing: '.1em' }}>
          {editingItem ? 'EDIT ITEM' : 'NEW ITEM'}
        </span>
        <button
          type="button"
          onClick={onCancel}
          style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#59677e', display: 'flex', alignItems: 'center' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Title full-width */}
      <label style={labelStyle}>
        TITLE
        <input
          style={inputStyle}
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Block title…"
          required
          autoFocus
        />
      </label>

      {/* Row: day + category */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
        <label style={labelStyle}>
          DAY
          <select style={inputStyle} value={form.day} onChange={(e) => set('day', Number(e.target.value))}>
            {DAYS.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          CATEGORY
          <select style={inputStyle} value={form.category} onChange={(e) => set('category', e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Row: start + end */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
        <label style={labelStyle}>
          START TIME
          <input
            type="time"
            style={inputStyle}
            value={form.startTime}
            onChange={(e) => set('startTime', e.target.value)}
            required
          />
        </label>
        <label style={labelStyle}>
          END TIME
          <input
            type="time"
            style={inputStyle}
            value={form.endTime}
            onChange={(e) => set('endTime', e.target.value)}
            required
          />
        </label>
      </div>

      {/* Notes */}
      <label style={{ ...labelStyle, marginTop: '8px' }}>
        NOTES (optional)
        <textarea
          style={{ ...inputStyle, resize: 'none', height: '46px' }}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Any context…"
        />
      </label>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
        {editingItem && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#9b6570', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '7px' }}
          >
            <Trash2 size={12} /> Delete
          </button>
        ) : (
          <span />
        )}
        <div style={{ display: 'flex', gap: '7px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#6b7891', cursor: 'pointer', fontSize: '8px' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ padding: '6px 14px', borderRadius: '8px', border: 0, background: 'linear-gradient(135deg,#60e7dc,#7a7cf8)', color: '#0a0e1a', fontWeight: 700, cursor: 'pointer', fontSize: '8px' }}
          >
            {editingItem ? 'Save changes' : 'Add block'}
          </button>
        </div>
      </div>
    </motion.form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function TimetablePage() {
  const [view, setView] = useState<View>('daily');
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [formInitial, setFormInitial] = useState<FormState>(BLANK_FORM);
  const [activeDay, setActiveDay] = useState<number>(todayDayIndex());
  const [showHistory, setShowHistory] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setItems(loadItems());
  }, []);

  // Persist whenever items change
  useEffect(() => {
    saveItems(items);
  }, [items]);

  // ─ Handlers ─────────────────────────────────────────────────────────────────

  const openAddForm = useCallback(() => {
    setEditingItem(null);
    setFormInitial({ ...BLANK_FORM, day: view === 'daily' ? activeDay : todayDayIndex() });
    setShowForm(true);
  }, [view, activeDay]);

  const openEditForm = useCallback((item: ScheduleItem) => {
    setEditingItem(item);
    setFormInitial({
      title: item.title,
      startTime: item.startTime,
      endTime: item.endTime,
      day: item.day,
      category: item.category,
      notes: item.notes,
    });
    setShowForm(true);
  }, []);

  const handleSave = useCallback(
    (data: FormState) => {
      if (editingItem) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === editingItem.id
              ? { ...it, ...data }
              : it
          )
        );
      } else {
        const newItem: ScheduleItem = {
          id: genId(),
          ...data,
          completed: false,
        };
        setItems((prev) => [...prev, newItem]);
      }
      setShowForm(false);
      setEditingItem(null);
    },
    [editingItem]
  );

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setShowForm(false);
    setEditingItem(null);
  }, []);

  const handleToggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              completed: !it.completed,
              completedAt: !it.completed ? new Date().toISOString() : undefined,
            }
          : it
      )
    );
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingItem(null);
  }, []);

  // ─ Derived data ───────────────────────────────────────────────────────────

  const todayIdx = todayDayIndex();

  const dailyItems = items
    .filter((it) => it.day === activeDay && !it.completed)
    .sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime));

  const completedItems = items
    .filter((it) => it.completed)
    .sort((a, b) => {
      if (!a.completedAt || !b.completedAt) return 0;
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    });

  const totalItems = items.length;
  const completedCount = items.filter((it) => it.completed).length;
  const todayCount = items.filter((it) => it.day === todayIdx && !it.completed).length;
  const weeklyHours = items
    .filter((it) => !it.completed)
    .reduce((acc, it) => acc + Math.max(0, parseMinutes(it.endTime) - parseMinutes(it.startTime)), 0) / 60;

  // ─ Weekly view helpers ────────────────────────────────────────────────────

  const weeklyByDay = DAYS.map((_, dayIdx) =>
    items
      .filter((it) => it.day === dayIdx && !it.completed)
      .sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime))
  );

  // ─ Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="product-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ── Header ── */}
      <div className="product-heading">
        <div className="product-title-icon">
          <Calendar size={17} />
        </div>
        <div>
          <span>PLAN · STRUCTURE · EXECUTE</span>
          <strong>Schedule</strong>
          <small>Weekly timetable stored locally. Backend persistence coming soon.</small>
        </div>
        <span className="connection-state" title="Schedule data is stored in localStorage only.">
          LOCAL ONLY
        </span>
      </div>

      {/* ── Local-only notice ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '8px 12px',
          margin: '8px 0',
          borderRadius: '10px',
          border: '1px solid rgba(240,169,78,.2)',
          background: 'rgba(240,169,78,.06)',
          color: '#c49040',
          fontSize: '7px',
          lineHeight: 1.5,
        }}
      >
        <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: '1px' }} />
        <span>
          Schedule items are stored locally in this browser session. Backend persistence coming soon.
          Data persists across tab switches but will be lost if browser storage is cleared.
        </span>
      </div>

      {/* ── Metrics ── */}
      <div className="page-metric-row" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
        <div className="page-metric">
          <span>Total Blocks</span>
          <strong>{totalItems}</strong>
          <small>ALL DAYS</small>
        </div>
        <div className="page-metric metric-1">
          <span>Today Remaining</span>
          <strong>{todayCount}</strong>
          <small>{DAYS[todayIdx].toUpperCase()}</small>
        </div>
        <div className="page-metric metric-2">
          <span>Completed</span>
          <strong>{completedCount}</strong>
          <small>ALL TIME</small>
        </div>
        <div className="page-metric">
          <span>Planned Hours</span>
          <strong>{weeklyHours.toFixed(1)}h</strong>
          <small>THIS WEEK</small>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="product-tabs">
        <button
          className={view === 'daily' ? 'product-tab-active' : ''}
          onClick={() => setView('daily')}
        >
          Daily Schedule
        </button>
        <button
          className={view === 'weekly' ? 'product-tab-active' : ''}
          onClick={() => setView('weekly')}
        >
          Weekly Grid
        </button>
        <button
          className={showHistory && view === 'daily' ? 'product-tab-active' : ''}
          onClick={() => { setView('daily'); setShowHistory((s) => !s); }}
        >
          Completed History {completedCount > 0 ? `(${completedCount})` : ''}
        </button>
      </div>

      {/* ── Add button row ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 0 2px' }}>
        <button
          onClick={openAddForm}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '7px 13px',
            borderRadius: '9px',
            border: '1px solid rgba(96,231,220,.25)',
            background: 'rgba(96,231,220,.07)',
            color: '#60e7dc',
            cursor: 'pointer',
            fontSize: '8px',
            fontWeight: 600,
          }}
        >
          <Plus size={13} /> Add Block
        </button>
      </div>

      {/* ── Inline form ── */}
      <AnimatePresence>
        {showForm && (
          <InlineForm
            key="form"
            initial={formInitial}
            editingItem={editingItem}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={editingItem ? () => handleDelete(editingItem.id) : undefined}
          />
        )}
      </AnimatePresence>

      {/* ── Daily view ── */}
      {view === 'daily' && !showHistory && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Day selector */}
          <div className="day-tabs" style={{ marginTop: '6px' }}>
            {DAYS.map((d, i) => (
              <button
                key={d}
                className={activeDay === i ? 'day-tab-active' : ''}
                onClick={() => setActiveDay(i)}
              >
                <span>{DAY_SHORT[i]}</span>
                <small>
                  {i === todayIdx ? 'TODAY' : i === 5 || i === 6 ? 'WKD' : '—'}
                </small>
              </button>
            ))}
          </div>

          <div className="page-primary-panel" style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '8px', fontWeight: 700, color: '#8a96ad', letterSpacing: '.1em' }}>
                {DAYS[activeDay].toUpperCase()} · {dailyItems.length} BLOCK{dailyItems.length !== 1 ? 'S' : ''}
              </span>
              {activeDay === todayIdx && (
                <span style={{ fontSize: '7px', color: '#60e7dc', fontWeight: 600, letterSpacing: '.08em' }}>
                  ● TODAY
                </span>
              )}
            </div>

            <AnimatePresence>
              {dailyItems.length === 0 ? (
                <div className="page-empty" style={{ minHeight: '200px' }}>
                  <Clock size={18} />
                  <strong>No blocks scheduled</strong>
                  <span>Click "Add Block" to create a schedule item for {DAYS[activeDay]}.</span>
                </div>
              ) : (
                dailyItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onEdit={openEditForm}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ── Weekly view ── */}
      {view === 'weekly' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0,1fr))',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            {DAYS.map((day, i) => {
              const dayItems = weeklyByDay[i];
              const isToday = i === todayIdx;
              return (
                <div key={day}>
                  {/* Column header */}
                  <div
                    style={{
                      padding: '6px 8px',
                      marginBottom: '6px',
                      borderRadius: '9px',
                      border: isToday
                        ? '1px solid rgba(96,231,220,.3)'
                        : '1px solid rgba(255,255,255,.06)',
                      background: isToday
                        ? 'rgba(96,231,220,.08)'
                        : 'rgba(255,255,255,.03)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '8px', fontWeight: 700, color: isToday ? '#60e7dc' : '#8a96ad' }}>
                      {DAY_SHORT[i]}
                    </div>
                    {isToday && (
                      <div style={{ fontSize: '6px', color: '#60e7dc', letterSpacing: '.08em' }}>TODAY</div>
                    )}
                    <div style={{ fontSize: '7px', color: '#59677e', marginTop: '1px' }}>
                      {dayItems.length > 0 ? `${dayItems.length} block${dayItems.length !== 1 ? 's' : ''}` : '—'}
                    </div>
                  </div>

                  {/* Column items */}
                  {dayItems.length === 0 ? (
                    <div
                      style={{
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        border: '1px dashed rgba(255,255,255,.05)',
                        color: '#3d4860',
                        fontSize: '7px',
                      }}
                    >
                      empty
                    </div>
                  ) : (
                    dayItems.map((item) => {
                      const c = CATEGORY_COLORS[item.category];
                      return (
                        <button
                          key={item.id}
                          onClick={() => openEditForm(item)}
                          title={`${item.startTime}–${item.endTime} · ${item.title}`}
                          style={{
                            width: '100%',
                            marginBottom: '5px',
                            padding: '7px 7px',
                            borderRadius: '9px',
                            border: `1px solid ${c.border}33`,
                            borderLeft: `3px solid ${c.border}`,
                            background: c.bg,
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'grid',
                            gap: '3px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '8px',
                              fontWeight: 600,
                              color: '#d9e0ed',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                            }}
                          >
                            {item.title}
                          </span>
                          <span style={{ fontSize: '6px', color: '#59677e', whiteSpace: 'nowrap' }}>
                            {item.startTime}–{item.endTime}
                          </span>
                          <CategoryBadge cat={item.category} />
                        </button>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Completed History ── */}
      {view === 'daily' && showHistory && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="page-primary-panel" style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '8px', fontWeight: 700, color: '#8a96ad', letterSpacing: '.1em' }}>
                COMPLETED HISTORY · {completedCount} ITEM{completedCount !== 1 ? 'S' : ''}
              </span>
              <button
                onClick={() => setShowHistory(false)}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#6b7891', display: 'flex', alignItems: 'center' }}
              >
                <X size={13} />
              </button>
            </div>

            {completedItems.length === 0 ? (
              <div className="page-empty" style={{ minHeight: '160px' }}>
                <CheckCircle2 size={18} />
                <strong>No completed blocks yet</strong>
                <span>Completed schedule items will appear here.</span>
              </div>
            ) : (
              <AnimatePresence>
                {completedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      marginBottom: '6px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,.06)',
                      background: 'rgba(255,255,255,.02)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={12} color="#60e7dc" />
                        <strong style={{ fontSize: '8px', color: '#8a96ad', textDecoration: 'line-through' }}>
                          {item.title}
                        </strong>
                        <CategoryBadge cat={item.category} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '6px', color: '#4d5a72' }}>
                          {DAYS[item.day]} · {item.startTime}–{item.endTime}
                        </span>
                        {item.completedAt && (
                          <span style={{ fontSize: '6px', color: '#4d5a72' }}>
                            ✓ {new Date(item.completedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleToggle(item.id)}
                        title="Restore to active"
                        style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#59677e', padding: '3px', display: 'flex', alignItems: 'center' }}
                      >
                        <Clock size={11} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete permanently"
                        style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#8a4f5e', padding: '3px', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
