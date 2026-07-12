/**
 * Audit Types
 * Business Rule: Audit discrepancies are auto-generated for Missing or Damaged assets.
 */
import type { UUID, ISODateString } from "./common.types";

export type AuditStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type AuditItemStatus = "VERIFIED" | "MISSING" | "DAMAGED" | "UNVERIFIED";

export type DiscrepancyStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "WRITTEN_OFF";

export interface AuditCycle {
  id: UUID;
  name: string;
  description: string | null;
  organizationId: UUID;
  departmentId: UUID | null;
  departmentName: string | null;
  status: AuditStatus;
  startDate: ISODateString;
  endDate: ISODateString | null;
  conductedById: UUID;
  conductedByName: string;
  totalAssets: number;
  verifiedCount: number;
  missingCount: number;
  damagedCount: number;
  createdAt: ISODateString;
}

export interface AuditItem {
  id: UUID;
  auditCycleId: UUID;
  assetId: UUID;
  assetTag: string;
  assetName: string;
  expectedLocation: string | null;
  expectedCondition: string;
  actualLocation: string | null;
  actualCondition: string | null;
  status: AuditItemStatus;
  notes: string | null;
  verifiedAt: ISODateString | null;
  verifiedById: UUID | null;
  verifiedByName: string | null;
}

export interface Discrepancy {
  id: UUID;
  auditCycleId: UUID;
  auditCycleName: string;
  assetId: UUID;
  assetTag: string;
  assetName: string;
  discrepancyType: AuditItemStatus;
  description: string;
  status: DiscrepancyStatus;
  resolvedById: UUID | null;
  resolvedByName: string | null;
  resolutionNotes: string | null;
  resolvedAt: ISODateString | null;
  createdAt: ISODateString;
}

export interface CreateAuditRequest {
  name: string;
  description?: string;
  departmentId?: UUID;
  startDate: string;
  endDate?: string;
}

export interface RecordAuditItemRequest {
  auditItemId: UUID;
  status: AuditItemStatus;
  actualLocation?: string;
  actualCondition?: string;
  notes?: string;
}
