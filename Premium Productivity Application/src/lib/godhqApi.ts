import type {
  DailyRecord,
  ActivityLog,
  Task,
  DiaryEntry,
  Goal,
  Project,
  DSAEntry,
  CommunicationEntry,
  WeeklyAnalytics,
  MonthlyAnalytics,
  YearlyAnalytics,
  StreaksData,
  UserSettings,
  Certification,
  Competition,
  WeeklyReview,
  MonthlyReview,
  SearchResult,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text || "Unknown error"}`);
  }

  return (await response.json()) as T;
}

export const dailyApi = {
  get: (date: string) => request<DailyRecord>(`/daily/${date}`),
  updateChecklist: (date: string, updates: Partial<DailyRecord>) =>
    request<DailyRecord>(`/daily/${date}/checklist`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  updateMeasurements: (date: string, updates: Partial<DailyRecord>) =>
    request<DailyRecord>(`/daily/${date}/measurements`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
};

export const tasksApi = {
  list: (params?: { date?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.date) q.append("date", params.date);
    if (params?.status) q.append("status", params.status);
    const qs = q.toString();
    return request<Task[]>(`/tasks${qs ? `?${qs}` : ""}`);
  },
  create: (data: Partial<Task>) =>
    request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ status: string; id: number }>(`/tasks/${id}`, { method: "DELETE" }),
};

export const activitiesApi = {
  list: (date?: string) => request<ActivityLog[]>(`/activities${date ? `?date=${date}` : ""}`),
  create: (data: Partial<ActivityLog>) =>
    request<ActivityLog>("/activities", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ status: string; id: number }>(`/activities/${id}`, { method: "DELETE" }),
};

export const growthApi = {
  getGoals: () => request<Goal[]>("/growth/goals"),
  createGoal: (data: Partial<Goal>) =>
    request<Goal>("/growth/goals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateGoal: (id: number, data: Partial<Goal>) =>
    request<Goal>(`/growth/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteGoal: (id: number) =>
    request<{ status: string; id: number }>(`/growth/goals/${id}`, { method: "DELETE" }),

  getProjects: () => request<Project[]>("/growth/projects"),
  createProject: (data: Partial<Project>) =>
    request<Project>("/growth/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (id: number, data: Partial<Project>) =>
    request<Project>(`/growth/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProject: (id: number) =>
    request<{ status: string; id: number }>(`/growth/projects/${id}`, { method: "DELETE" }),
};

export const analyticsApi = {
  getWeekly: (date: string) => request<WeeklyAnalytics>(`/analytics/weekly?date=${date}`),
  getMonthly: (date: string) => request<MonthlyAnalytics>(`/analytics/monthly?date=${date}`),
  getYearly: (year: number) => request<YearlyAnalytics>(`/analytics/yearly?year=${year}`),
  getStreaks: (date: string) => request<StreaksData>(`/analytics/streaks?date=${date}`),
  getHistory: (params?: { start_date?: string; end_date?: string; min_score?: number; max_score?: number }) => {
    const q = new URLSearchParams();
    if (params?.start_date) q.append("start_date", params.start_date);
    if (params?.end_date) q.append("end_date", params.end_date);
    if (params?.min_score !== undefined) q.append("min_score", params.min_score.toString());
    if (params?.max_score !== undefined) q.append("max_score", params.max_score.toString());
    const qs = q.toString();
    return request<DailyRecord[]>(`/analytics/history${qs ? `?${qs}` : ""}`);
  },
};

export const dsaApi = {
  list: (params?: { date?: string; difficulty?: string; topic?: string }) => {
    const q = new URLSearchParams();
    if (params?.date) q.append("date", params.date);
    if (params?.difficulty) q.append("difficulty", params.difficulty);
    if (params?.topic) q.append("topic", params.topic);
    const qs = q.toString();
    return request<DSAEntry[]>(`/dsa${qs ? `?${qs}` : ""}`);
  },
  stats: () =>
    request<{ total: number; easy: number; medium: number; hard: number; topics: Record<string, number> }>("/dsa/stats"),
  create: (data: Partial<DSAEntry>) =>
    request<DSAEntry>("/dsa", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ status: string; id: number }>(`/dsa/${id}`, { method: "DELETE" }),
};

export const commApi = {
  list: (date?: string) => request<CommunicationEntry[]>(`/communication${date ? `?date=${date}` : ""}`),
  create: (data: Partial<CommunicationEntry>) =>
    request<CommunicationEntry>("/communication", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ status: string; id: number }>(`/communication/${id}`, { method: "DELETE" }),
};

export const planningApi = {
  getWeeklyReview: (weekStart: string) => request<WeeklyReview>(`/planning/reviews/weekly/${weekStart}`),
  updateWeeklyReview: (weekStart: string, data: Partial<WeeklyReview>) =>
    request<WeeklyReview>(`/planning/reviews/weekly/${weekStart}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getMonthlyReview: (month: string) => request<MonthlyReview>(`/planning/reviews/monthly/${month}`),
  updateMonthlyReview: (month: string, data: Partial<MonthlyReview>) =>
    request<MonthlyReview>(`/planning/reviews/monthly/${month}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getCertifications: () => request<Certification[]>("/planning/certifications"),
  createCertification: (data: Partial<Certification>) =>
    request<Certification>("/planning/certifications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteCertification: (id: number) =>
    request<{ status: string; id: number }>(`/planning/certifications/${id}`, { method: "DELETE" }),

  getCompetitions: () => request<Competition[]>("/planning/competitions"),
  createCompetition: (data: Partial<Competition>) =>
    request<Competition>("/planning/competitions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteCompetition: (id: number) =>
    request<{ status: string; id: number }>(`/planning/competitions/${id}`, { method: "DELETE" }),
};

export const diaryApi = {
  get: (date: string) => request<DiaryEntry>(`/diary/${date}`),
  update: (date: string, data: Partial<DiaryEntry>) =>
    request<DiaryEntry>(`/diary/${date}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const settingsApi = {
  get: () => request<UserSettings>("/settings"),
  update: (data: Partial<UserSettings>) =>
    request<UserSettings>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const searchApi = {
  search: (query: string) => request<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(query)}`),
};

// Re-export as unified godhqApi for backwards compatibility and easy importing
export const godhqApi = {
  daily: dailyApi,
  tasks: tasksApi,
  activities: activitiesApi,
  growth: growthApi,
  analytics: analyticsApi,
  dsa: dsaApi,
  comm: commApi,
  planning: planningApi,
  diary: diaryApi,
  settings: settingsApi,
  search: searchApi,

  // Flat helper methods
  getDaily: dailyApi.get,
  updateDailyChecklist: dailyApi.updateChecklist,
  updateDailyMeasurements: dailyApi.updateMeasurements,
  getTasks: tasksApi.list,
  createTask: tasksApi.create,
  updateTask: tasksApi.update,
  deleteTask: tasksApi.delete,
  getActivities: activitiesApi.list,
  createActivity: activitiesApi.create,
  deleteActivity: activitiesApi.delete,
  getGoals: growthApi.getGoals,
  createGoal: growthApi.createGoal,
  updateGoal: growthApi.updateGoal,
  deleteGoal: growthApi.deleteGoal,
  getProjects: growthApi.getProjects,
  createProject: growthApi.createProject,
  updateProject: growthApi.updateProject,
  deleteProject: growthApi.deleteProject,
  getWeeklyAnalytics: analyticsApi.getWeekly,
  getMonthlyAnalytics: analyticsApi.getMonthly,
  getYearlyAnalytics: analyticsApi.getYearly,
  getStreaks: analyticsApi.getStreaks,
  getHistory: analyticsApi.getHistory,
  getDiary: diaryApi.get,
  updateDiary: diaryApi.update,
  getSettings: settingsApi.get,
  updateSettings: settingsApi.update,
  getDSA: dsaApi.list,
  createDSA: dsaApi.create,
  deleteDSA: dsaApi.delete,
  getDSAStats: dsaApi.stats,
  getComm: commApi.list,
  createComm: commApi.create,
  deleteComm: commApi.delete,
  getWeeklyReview: planningApi.getWeeklyReview,
  updateWeeklyReview: planningApi.updateWeeklyReview,
  getMonthlyReview: planningApi.getMonthlyReview,
  updateMonthlyReview: planningApi.updateMonthlyReview,
  getCertifications: planningApi.getCertifications,
  createCertification: planningApi.createCertification,
  deleteCertification: planningApi.deleteCertification,
  getCompetitions: planningApi.getCompetitions,
  createCompetition: planningApi.createCompetition,
  deleteCompetition: planningApi.deleteCompetition,
  doSearch: searchApi.search,
};

export default godhqApi;
