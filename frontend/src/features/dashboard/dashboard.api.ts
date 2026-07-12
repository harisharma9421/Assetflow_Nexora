"use client";

import api from "@/lib/api";

export interface DashboardKpis {
  assetsAvailable: number;
  assetsAllocated: number;
  maintenanceToday: number;
  activeBookings: number;
  pendingTransfers: number;
  upcomingReturns: number;
}

export interface OverdueReturn {
  allocationId: number;
  assetId: number;
  assetTag: string;
  assetName: string;
  holderEmployeeId: number | null;
  holderDepartmentId: number | null;
  expectedReturnDate: string;
  daysOverdue: number;
}

export const fallbackDashboardKpis: DashboardKpis = {
  assetsAvailable: 0,
  assetsAllocated: 0,
  maintenanceToday: 0,
  activeBookings: 0,
  pendingTransfers: 0,
  upcomingReturns: 0,
};

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const response = await api.get<DashboardKpis>("/dashboard/kpis");
  return response.data;
}

export async function getOverdueReturns(): Promise<OverdueReturn[]> {
  const response = await api.get<OverdueReturn[]>("/dashboard/overdue-returns");
  return response.data;
}
