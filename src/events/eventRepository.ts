import { Event } from './event'

export interface EventRepository {
  getAll(): Promise<Event[]>;
  create(event: Event): Promise<Event>;
  getEventById(eventId: string): Promise<Event | null>;
  getEventsByIds(eventIds: string[]): Promise<Event[]>;
  getEventsByOrganizerId(organizerId: string): Promise<Event[]>;
  update(event: Event): Promise<Event>;
}
