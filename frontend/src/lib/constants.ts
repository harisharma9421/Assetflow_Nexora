/**
 * Application-wide constants for Assetra ERP
 */

// ─── Routes ────────────────────────────────────────────────────────────────

export const ROUTES = {
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",


  // Dashboard
  DASHBOARD: "/dashboard",

  // Assets
  ASSETS: "/assets",
  ASSET_NEW: "/assets/new",
  ASSET_DETAIL: (id: string) => `/assets/${id}`,
  ASSET_EDIT: (id: string) => `/assets/${id}/edit`,

  // Allocations
  ALLOCATIONS: "/allocations",
  ALLOCATION_NEW: "/allocations/new",

  // Transfers
  TRANSFERS: "/transfers",
  TRANSFER_NEW: "/transfers/new",

  // Bookings
  BOOKINGS: "/bookings",
  BOOKING_NEW: "/bookings/new",

  // Maintenance
  MAINTENANCE: "/maintenance",
  MAINTENANCE_NEW: "/maintenance/new",
  MAINTENANCE_DETAIL: (id: string) => `/maintenance/${id}`,

  // Audits
  AUDITS: "/audits",
  AUDIT_NEW: "/audits/new",
  AUDIT_DETAIL: (id: string) => `/audits/${id}`,

  // Reports
  REPORTS: "/reports",

  // Notifications
  NOTIFICATIONS: "/notifications",

  // Activity Logs
  ACTIVITY_LOGS: "/activity-logs",

  // Settings
  SETTINGS: {
    ROOT: "/settings",
    ORGANIZATION: "/settings/organization",
    DEPARTMENTS: "/settings/departments",
    USERS: "/settings/users",
    PROFILE: "/settings/profile",
  },
} as const;

// ─── User Roles ─────────────────────────────────────────────────────────────

export const USER_ROLES = {
  ADMIN: "ADMIN",
  ASSET_MANAGER: "ASSET_MANAGER",
  DEPARTMENT_HEAD: "DEPARTMENT_HEAD",
  EMPLOYEE: "EMPLOYEE",
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  ASSET_MANAGER: "Asset Manager",
  DEPARTMENT_HEAD: "Department Head",
  EMPLOYEE: "Employee",
};

// ─── Asset Statuses ─────────────────────────────────────────────────────────

export const ASSET_STATUSES = {
  AVAILABLE: "AVAILABLE",
  ALLOCATED: "ALLOCATED",
  RESERVED: "RESERVED",
  UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
  LOST: "LOST",
  RETIRED: "RETIRED",
  DISPOSED: "DISPOSED",
} as const;

export const ASSET_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  ALLOCATED: "Allocated",
  RESERVED: "Reserved",
  UNDER_MAINTENANCE: "Under Maintenance",
  LOST: "Lost",
  RETIRED: "Retired",
  DISPOSED: "Disposed",
};

export const ASSET_CONDITION_LABELS: Record<string, string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  DAMAGED: "Damaged",
};

// ─── Maintenance ────────────────────────────────────────────────────────────

export const MAINTENANCE_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  PREVENTIVE: "Preventive",
  CORRECTIVE: "Corrective",
  PREDICTIVE: "Predictive",
  EMERGENCY: "Emergency",
};

// ─── Booking ─────────────────────────────────────────────────────────────────

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// ─── Pagination ──────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ─── Local Storage Keys ──────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "assetra_access_token",
  REFRESH_TOKEN: "assetra_refresh_token",
  USER: "assetra_user",
  THEME: "assetra_theme",
} as const;

// ─── API ──────────────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
