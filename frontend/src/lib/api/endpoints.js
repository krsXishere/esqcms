// API Endpoints for QC Monitoring System

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },

  // Dashboard
  DASHBOARD: {
    SUMMARY: "/dashboard/summary",
    KPI: "/dashboard/kpi",
    ANALYTICS: "/dashboard/analytics",
    RECENT_QC: "/dashboard/recent-qc",
    RISK_HIGHLIGHT: "/dashboard/risk-highlight",
  },

  // Checksheet
  CHECKSHEET: {
    LIST: "/checksheets",
    DETAIL: (type, id) => `/checksheets/${type}/${id}`,
    CREATE: "/checksheets",
    UPDATE: (type, id) => `/checksheets/${type}/${id}`,
    DELETE: (type, id) => `/checksheets/${type}/${id}`,
    REVISIONS: "/checksheets/revisions",
    REVISION_DETAIL: (type, id) => `/checksheets/${type}/${id}/revisions`,
    CREATE_REVISION: (type, id) => `/checksheets/${type}/${id}/revise`,
    APPROVE: (type, id) => `/checksheets/${type}/${id}/approve`,
    REJECT: (type, id) => `/checksheets/${type}/${id}/reject`,
    EXPORT: (type, id) => `/checksheets/${type}/${id}/export`,
  },

  // Analytics
  ANALYTICS: {
    OVERVIEW: "/analytics/overview",
    NG_TREND: "/analytics/ng-trend",
    NG_PARETO: "/analytics/ng-pareto",
    CPK_ANALYSIS: "/analytics/cpk",
    MODEL_PERFORMANCE: "/analytics/model-performance",
    PART_PERFORMANCE: "/analytics/part-performance",
  },

  // Templates
  TEMPLATES: {
    LIST: "/templates",
    DETAIL: (id) => `/templates/${id}`,
    CREATE: "/templates",
    UPDATE: (id) => `/templates/${id}`,
    DELETE: (id) => `/templates/${id}`,
    DUPLICATE: (id) => `/templates/${id}/duplicate`,
    PUBLISH: (id) => `/templates/${id}/publish`,
  },

  // Master Data - Models
  MODELS: {
    LIST: "/master/models",
    DETAIL: (id) => `/master/models/${id}`,
    CREATE: "/master/models",
    UPDATE: (id) => `/master/models/${id}`,
    DELETE: (id) => `/master/models/${id}`,
  },

  // Master Data - Parts
  PARTS: {
    LIST: "/master/parts",
    DETAIL: (id) => `/master/parts/${id}`,
    CREATE: "/master/parts",
    UPDATE: (id) => `/master/parts/${id}`,
    DELETE: (id) => `/master/parts/${id}`,
  },

  // Master Data - Customers
  CUSTOMERS: {
    LIST: "/master/customers",
    DETAIL: (id) => `/master/customers/${id}`,
    CREATE: "/master/customers",
    UPDATE: (id) => `/master/customers/${id}`,
    DELETE: (id) => `/master/customers/${id}`,
  },

  // Master Data - Materials
  MATERIALS: {
    LIST: "/master/materials",
    DETAIL: (id) => `/master/materials/${id}`,
    CREATE: "/master/materials",
    UPDATE: (id) => `/master/materials/${id}`,
    DELETE: (id) => `/master/materials/${id}`,
  },

  // Master Data - Shifts
  SHIFTS: {
    LIST: "/master/shifts",
    DETAIL: (id) => `/master/shifts/${id}`,
    CREATE: "/master/shifts",
    UPDATE: (id) => `/master/shifts/${id}`,
    DELETE: (id) => `/master/shifts/${id}`,
  },

  // Master Data - Sections
  SECTIONS: {
    LIST: "/master/sections",
    DETAIL: (id) => `/master/sections/${id}`,
    CREATE: "/master/sections",
    UPDATE: (id) => `/master/sections/${id}`,
    DELETE: (id) => `/master/sections/${id}`,
  },

  // Master Data - Reject Reasons
  REJECT_REASONS: {
    LIST: "/master/reject-reasons",
    DETAIL: (id) => `/master/reject-reasons/${id}`,
    CREATE: "/master/reject-reasons",
    UPDATE: (id) => `/master/reject-reasons/${id}`,
    DELETE: (id) => `/master/reject-reasons/${id}`,
  },

  // Master Data - Drawings
  DRAWINGS: {
    LIST: "/master/drawings",
    DETAIL: (id) => `/master/drawings/${id}`,
    CREATE: "/master/drawings",
    UPDATE: (id) => `/master/drawings/${id}`,
    DELETE: (id) => `/master/drawings/${id}`,
    UPLOAD: "/master/drawings/upload",
    VERSIONS: (id) => `/master/drawings/${id}/versions`,
  },

  // Users
  USERS: {
    LIST: "/users",
    DETAIL: (id) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
    TOGGLE_STATUS: (id) => `/users/${id}/toggle-status`,
  },
};

// Query param builders
export const buildQueryParams = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query.append(key, value);
    }
  });

  return query.toString();
};
