export type EventStatus = "draft" | "published" | "cancelled" | "past";

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  startDatetime: Date;
  endDatetime: Date;
  capacity?: number;
  organizerId: string;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}