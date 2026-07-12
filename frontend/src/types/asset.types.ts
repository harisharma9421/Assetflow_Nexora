/**
 * Asset Types
 * Covers the complete asset lifecycle in Assetra ERP
 */
import type { UUID, ISODateString } from "./common.types";

export type AssetStatus =
  | "AVAILABLE"
  | "ALLOCATED"
  | "RESERVED"
  | "UNDER_MAINTENANCE"
  | "LOST"
  | "RETIRED"
  | "DISPOSED";

export type AssetCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "DAMAGED";

export interface AssetCategory {
  id: UUID;
  name: string;
  description: string | null;
  parentCategoryId: UUID | null;
  organizationId: UUID;
}

export interface Asset {
  id: UUID;
  assetTag: string;
  serialNumber: string | null;
  name: string;
  description: string | null;
  categoryId: UUID;
  categoryName: string;
  status: AssetStatus;
  condition: AssetCondition;
  purchaseDate: ISODateString | null;
  purchasePrice: number | null;
  currentValue: number | null;
  warrantyExpiry: ISODateString | null;
  location: string | null;
  departmentId: UUID | null;
  departmentName: string | null;
  assignedToId: UUID | null;
  assignedToName: string | null;
  organizationId: UUID;
  qrCodeUrl: string | null;
  notes: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateAssetRequest {
  assetTag: string;
  serialNumber?: string;
  name: string;
  description?: string;
  categoryId: UUID;
  condition: AssetCondition;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  location?: string;
  departmentId?: UUID;
  notes?: string;
}

export interface UpdateAssetRequest extends Partial<CreateAssetRequest> {
  id: UUID;
}

export interface AssetFilters {
  status?: AssetStatus;
  condition?: AssetCondition;
  categoryId?: UUID;
  departmentId?: UUID;
  query?: string;
}

export interface AssetLifecycleEvent {
  id: UUID;
  assetId: UUID;
  fromStatus: AssetStatus | null;
  toStatus: AssetStatus;
  performedById: UUID;
  performedByName: string;
  notes: string | null;
  createdAt: ISODateString;
}
