/**
 * Allocation Types
 * Business Rule: An asset can never have more than one active allocation.
 */
import type { UUID, ISODateString } from "./common.types";

export type AllocationStatus = "ACTIVE" | "RETURNED" | "OVERDUE";

export interface Allocation {
  id: UUID;
  assetId: UUID;
  assetTag: string;
  assetName: string;
  allocatedToId: UUID;
  allocatedToName: string;
  allocatedToEmail: string;
  departmentId: UUID;
  departmentName: string;
  allocatedById: UUID;
  allocatedByName: string;
  allocatedAt: ISODateString;
  expectedReturnDate: ISODateString | null;
  actualReturnDate: ISODateString | null;
  status: AllocationStatus;
  notes: string | null;
  returnNotes: string | null;
}

export interface AllocateAssetRequest {
  assetId: UUID;
  allocatedToId: UUID;
  expectedReturnDate?: string;
  notes?: string;
}

export interface ReturnAssetRequest {
  allocationId: UUID;
  returnNotes?: string;
  condition?: string;
}
