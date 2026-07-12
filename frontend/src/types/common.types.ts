/**
 * Common / Shared Types
 * Used across all modules in Nexora ERP
 */

export type UUID = string;

export type ISODateString = string;

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data: T;
  timestamp: ISODateString;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
  timestamp: ISODateString;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface SearchParams extends PageParams {
  query?: string;
}

export type Status = "ACTIVE" | "INACTIVE";

export interface SelectOption {
  label: string;
  value: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

