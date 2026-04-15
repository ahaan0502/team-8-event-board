import { Event } from "./event";

export interface EventRepository {
  create(event: Event): Promise<Event>;
  getEventById(eventId: string): Promise<Event | null>;
  update(event: Event): Promise<Event>;
}