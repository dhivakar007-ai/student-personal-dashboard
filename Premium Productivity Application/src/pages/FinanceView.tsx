import React from "react";
import { CircleDollarSign, Sparkles } from "lucide-react";

export const FinanceView: React.FC = () => {
  return (
    <div
      style={{
        borderRadius: "24px",
        padding: "60px 24px",
        background: "linear-gradient(145deg, rgba(32, 40, 65, 0.95), rgba(18, 24, 42, 0.95))",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 14px 34px rgba(0, 0, 0, 0.35)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "18px",
          background: "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(249, 115, 22, 0.2))",
          border: "1px solid rgba(251, 191, 36, 0.35)",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 16px",
          color: "#fbbf24",
        }}
      >
        <CircleDollarSign size={28} />
      </div>

      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "99px", background: "rgba(251, 191, 36, 0.12)", color: "#fbbf24", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: "12px" }}>
        <Sparkles size={12} /> PLANNED FOR V2
      </div>

      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px" }}>
        Personal Finance & Cash Flow Engine
      </h2>
      <p style={{ fontSize: "11px", color: "#8a96ad", maxWidth: "420px", margin: "0 auto", lineHeight: 1.5 }}>
        This module is scheduled for the next major release. It will integrate investment portfolio tracking, burn-rate telemetry, and runway analytics without altering current tracking databases.
      </p>
    </div>
  );
};
