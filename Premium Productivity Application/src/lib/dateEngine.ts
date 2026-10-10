// Date engine using vanilla Date objects for zero external dependency overhead
export const getToday = (): string => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const adjusted = new Date(d.getTime() - offset * 60000);
  return adjusted.toISOString().slice(0, 10);
};

export const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const formatISODate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getYesterday = (dateStr?: string): string => {
  const d = dateStr ? parseLocalDate(dateStr) : new Date();
  d.setDate(d.getDate() - 1);
  return formatISODate(d);
};

export const getNextDay = (dateStr?: string): string => {
  const d = dateStr ? parseLocalDate(dateStr) : new Date();
  d.setDate(d.getDate() + 1);
  return formatISODate(d);
};

export const getRelativeDate = (dateStr: string, offsetDays: number): string => {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + offsetDays);
  return formatISODate(d);
};

export const formatDateDisplay = (dateStr: string): string => {
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr: string): string => {
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export const formatMonthYear = (dateStr: string): string => {
  try {
    const parts = dateStr.split("-");
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = new Date(y, m, 1);
    return d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export const checkIsToday = (dateStr: string): boolean => {
  return dateStr === getToday();
};

export const checkIsYesterday = (dateStr: string): boolean => {
  return dateStr === getYesterday();
};
