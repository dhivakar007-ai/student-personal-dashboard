import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useDate } from "../context/DateContext";
import { formatDateDisplay } from "../lib/dateEngine";

export const DateControl: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    isCurrentDateToday,
  } = useDate();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 8px",
        borderRadius: "14px",
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
      }}
    >
      <button
        onClick={goToPreviousDay}
        title="Previous day"
        aria-label="Previous day"
        style={{
          width: "26px",
          height: "26px",
          display: "grid",
          placeItems: "center",
          borderRadius: "8px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          color: "#9db0cc",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9db0cc")}
      >
        <ChevronLeft size={14} />
      </button>

      <button
        onClick={goToToday}
        style={{
          padding: "3px 9px",
          borderRadius: "8px",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          background: isCurrentDateToday
            ? "linear-gradient(135deg, rgba(85, 227, 211, 0.22), rgba(126, 140, 255, 0.22))"
            : "transparent",
          color: isCurrentDateToday ? "#7de9f2" : "#8f9ab1",
          border: isCurrentDateToday
            ? "1px solid rgba(125, 233, 242, 0.35)"
            : "1px solid transparent",
          cursor: "pointer",
        }}
      >
        TODAY
      </button>

      <button
        onClick={goToNextDay}
        title="Next day"
        aria-label="Next day"
        style={{
          width: "26px",
          height: "26px",
          display: "grid",
          placeItems: "center",
          borderRadius: "8px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          color: "#9db0cc",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9db0cc")}
      >
        <ChevronRight size={14} />
      </button>

      <label
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "3px 8px",
          borderRadius: "8px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          color: "#dbe2ef",
          fontSize: "10px",
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "monospace",
        }}
      >
        <CalendarIcon size={12} color="#7de9f2" />
        <span>{selectedDate}</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            width: "100%",
            height: "100%",
            cursor: "pointer",
          }}
          title={formatDateDisplay(selectedDate)}
        />
      </label>
    </div>
  );
};
