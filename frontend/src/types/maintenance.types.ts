/**
 * Maintenance Types
 * Business Rule: Maintenance must be approved before work begins.
 * Business Rule: Maintenance completion automatically changes asset status back to Available.
 */
import type { UUID, ISODateString } from "./common.types";

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type MaintenanceStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type MaintenanceType = "PREVENTIVE" | "CORRECTIVE" | "PREDICTIVE" | "EMERGENCY";

export interface MaintenanceRequest {
  id: UUID;
  assetId: UUID;
  assetTag: string;
  assetName: string;
  requestedById: UUID;
  requestedByName: string;
  assignedToId: UUID | null;
  assignedToName: string | null;
  approvedById: UUID | null;
  approvedByName: string | null;
  maintenanceType: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  issueDescription: string;
  workDone: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  scheduledDate: ISODateString | null;
  completedDate: ISODateString | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateMaintenanceRequest {
  assetId: UUID;
  maintenanceType: MaintenanceType;
  priority: MaintenancePriority;
  issueDescription: string;
  estimatedCost?: number;
  scheduledDate?: string;
  notes?: string;
}

export interface ApproveMaintenanceRequest {
  maintenanceId: UUID;
  assignedToId?: UUID;
  notes?: string;
}

export interface CompleteMaintenanceRequest {
  maintenanceId: UUID;
  workDone: string;
  actualCost?: number;
  notes?: string;
}
