import React, { createContext, useContext, useState, useEffect } from "react";
import type { DailyRecord } from "../types";
import { dailyApi } from "../lib/godhqApi";
import {
  getToday,
  getYesterday,
  getNextDay,
  getRelativeDate,
  checkIsToday,
  checkIsYesterday,
} from "../lib/dateEngine";

interface DateContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
  goToYesterday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  isCurrentDateToday: boolean;
  isCurrentDateYesterday: boolean;
  dailyRecord: DailyRecord | null;
  refreshDailyRecord: () => Promise<void>;
  updateChecklist: (updates: Partial<DailyRecord>) => Promise<void>;
  updateMeasurements: (updates: Partial<DailyRecord>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [dailyRecord, setDailyRecord] = useState<DailyRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecord = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      const rec = await dailyApi.get(date);
      setDailyRecord(rec);
    } catch (err) {
      console.error("Failed to load daily record:", err);
      setError(err instanceof Error ? err.message : "Failed to load daily record");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRecord(selectedDate);
  }, [selectedDate]);

  const goToToday = () => setSelectedDate(getToday());
  const goToYesterday = () => setSelectedDate(getYesterday());
  const goToPreviousDay = () => setSelectedDate(getRelativeDate(selectedDate, -1));
  const goToNextDay = () => setSelectedDate(getNextDay(selectedDate));

  const updateChecklist = async (updates: Partial<DailyRecord>) => {
    if (!dailyRecord) return;
    // Optimistic UI update
    setDailyRecord((prev) => (prev ? { ...prev, ...updates } : prev));
    try {
      const updated = await dailyApi.updateChecklist(selectedDate, updates);
      setDailyRecord(updated);
    } catch (err) {
      console.error("Checklist update failed:", err);
      void fetchRecord(selectedDate);
    }
  };

  const updateMeasurements = async (updates: Partial<DailyRecord>) => {
    if (!dailyRecord) return;
    setDailyRecord((prev) => (prev ? { ...prev, ...updates } : prev));
    try {
      const updated = await dailyApi.updateMeasurements(selectedDate, updates);
      setDailyRecord(updated);
    } catch (err) {
      console.error("Measurements update failed:", err);
      void fetchRecord(selectedDate);
    }
  };

  const refreshDailyRecord = async () => {
    await fetchRecord(selectedDate);
  };

  return (
    <DateContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        goToToday,
        goToYesterday,
        goToPreviousDay,
        goToNextDay,
        isCurrentDateToday: checkIsToday(selectedDate),
        isCurrentDateYesterday: checkIsYesterday(selectedDate),
        dailyRecord,
        refreshDailyRecord,
        updateChecklist,
        updateMeasurements,
        loading,
        error,
      }}
    >
      {children}
    </DateContext.Provider>
  );
};

export const useDate = (): DateContextType => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error("useDate must be used within a DateProvider");
  }
  return context;
};
