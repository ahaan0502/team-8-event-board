import { Event } from "./event";

export interface EventRepository {
  create(event: Event): Promise<Event>;
  getEventById(eventId: string): Promise<Event | null>;
  getEventsByIds(eventIds: string[]): Promise<Event[]>;
  getEventsByOrganizerId(organizerId: string): Promise<Event[]>;
}