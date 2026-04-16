import { Event } from './event'
import { EventRepository } from './eventRepository'

const sampleEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Hack Night',
    description: 'Build together and practice coding.',
    location: 'CS Building',
    category: 'Tech',
    status: 'published',
    capacity: 20,
    startDatetime: new Date('2026-04-20T18:00:00'),
    endDatetime: new Date('2026-04-20T20:00:00'),
    organizerId: 'staff@app.test',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'event-2',
    title: 'Club Social',
    description: 'Casual meetup for members.',
    location: 'Student Union',
    category: 'Social',
    status: 'draft',
    capacity: 40,
    startDatetime: new Date('2026-04-22T17:00:00'),
    endDatetime: new Date('2026-04-22T19:00:00'),
    organizerId: 'staff@app.test',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const events = new Map<string, Event>(
  sampleEvents.map((event) => [event.id, event])
)

export class InMemoryEventRepository implements EventRepository {
  async create(event: Event): Promise<Event> {
    events.set(event.id, event)
    return event
  }

  async getEventById(eventId: string): Promise<Event | null> {
    return events.get(eventId) ?? null
  }

  async getEventsByIds(eventIds: string[]): Promise<Event[]> {
    const idSet = new Set(eventIds);
    return Array.from(events.values()).filter(event => idSet.has(event.id));
  }
  
  async getEventsByOrganizerId(organizerId: string): Promise<Event[]> {
    return Array.from(events.values()).filter(
      event => event.organizerId === organizerId
    );
  }
}