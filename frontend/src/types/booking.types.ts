/**
 * Booking Types
 * Business Rule: A booked resource cannot have overlapping bookings.
 */
import type { UUID, ISODateString } from "./common.types";

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Resource {
  id: UUID;
  name: string;
  description: string | null;
  location: string | null;
  capacity: number | null;
  categoryId: UUID;
  categoryName: string;
  isAvailable: boolean;
  organizationId: UUID;
  imageUrl: string | null;
}

export interface Booking {
  id: UUID;
  resourceId: UUID;
  resourceName: string;
  bookedById: UUID;
  bookedByName: string;
  departmentId: UUID;
  departmentName: string;
  startDateTime: ISODateString;
  endDateTime: ISODateString;
  purpose: string;
  attendees: number | null;
  status: BookingStatus;
  approvedById: UUID | null;
  approvedByName: string | null;
  approvedAt: ISODateString | null;
  rejectionReason: string | null;
  notes: string | null;
  createdAt: ISODateString;
}

export interface CreateBookingRequest {
  resourceId: UUID;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
  attendees?: number;
  notes?: string;
}

export interface BookingAvailabilityQuery {
  resourceId: UUID;
  startDateTime: string;
  endDateTime: string;
}
