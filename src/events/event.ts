export type EventStatus = "draft" | "published";

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  organizerId: string;
  status: EventStatus;
}