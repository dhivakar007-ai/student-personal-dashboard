import React, { useState } from "react";
import { motion } from "framer-motion";
import { Flame, BarChart3, History, CheckCircle2 } from "lucide-react";
import { HabitsView } from "./HabitsView";
import { AnalyticsView } from "./AnalyticsView";

export function HabitsAndStreaksView() {
  const tabs = ["Habits & Streaks", "Performance Analytics"];
  const [activeTab, setActiveTab] = useState("Habits & Streaks");

  return (
    <motion.div className="product-page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="product-heading">
        <div className="product-title-icon"><Flame size={19} /></div>
        <div>
          <span>REPEATED DISCIPLINE & LONG-TERM METRICS</span>
          <strong>Habits & Streaks</strong>
          <small>Consolidated performance, matrix consistency, and historical analytics without gamification.</small>
        </div>
        <span className="connection-state state-live">SQLITE POWERED</span>
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

      <div style={{ marginTop: "16px" }}>
        {activeTab === "Habits & Streaks" ? (
          <HabitsView />
        ) : (
          <AnalyticsView />
        )}
      </div>
    </motion.div>
  );
}
