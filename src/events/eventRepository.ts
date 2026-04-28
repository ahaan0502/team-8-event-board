import { Event } from './event'

export interface EventRepoFilter {
  status?: string;
  category?: string;
  startAfter?: Date;
  startBefore?: Date;
  query?: string;
}

export interface EventRepository {
  create(event: Event): Promise<Event>
  getEventById(eventId: string): Promise<Event | null>
  getEventsByIds(eventIds: string[]): Promise<Event[]>
  getEventsByOrganizerId(organizerId: string): Promise<Event[]>
  getAll(filters?: EventRepoFilter): Promise<Event[]>
  update(event: Event): Promise<Event>
}
