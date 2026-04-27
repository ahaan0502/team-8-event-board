import { Event } from './event'
import { EventRepository, EventRepoFilter } from './eventRepository'

const sampleEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Hack Night',
    description: 'Build together and practice coding.',
    location: 'CS Building',
    category: 'Tech',
    status: 'published',
    capacity: 20,
    startDatetime: new Date('2026-05-10T18:00:00'),
    endDatetime: new Date('2026-05-10T20:00:00'),
    organizerId: 'user-staff',
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
    startDatetime: new Date('2026-05-17T17:00:00'),
    endDatetime: new Date('2026-05-17T19:00:00'),
    organizerId: 'user-staff',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'event-3',
    title: 'Spring Concert',
    description: 'Live music event.',
    location: 'Campus Center',
    category: 'Entertainment',
    status: 'published',
    capacity: 100,
    startDatetime: new Date('2026-05-24T19:00:00'),
    endDatetime: new Date('2026-05-24T21:00:00'),
    organizerId: 'user-staff',
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

  async update(event: Event): Promise<Event> {
    events.set(event.id, event)
    return event
  }

  async getEventById(eventId: string): Promise<Event | null> {
    return events.get(eventId) ?? null
  }

  async getEventsByIds(eventIds: string[]): Promise<Event[]> {
    const idSet = new Set(eventIds)
    return Array.from(events.values()).filter((event) => idSet.has(event.id))
  }

  async getEventsByOrganizerId(organizerId: string): Promise<Event[]> {
    return Array.from(events.values()).filter(
      (event) => event.organizerId === organizerId
    )
  }

  async getAll(filters?: EventRepoFilter): Promise<Event[]> {
    let results = Array.from(events.values());

    if (filters?.status) results = results.filter(e => e.status === filters.status);
    if (filters?.category) results = results.filter(e => e.category === filters.category);
    if (filters?.startAfter) results = results.filter(e => e.startDatetime >= filters.startAfter!);
    if (filters?.startBefore) results = results.filter(e => e.startDatetime <= filters.startBefore!);
    if (filters?.query?.trim()) {
      const q = filters.query.trim().toLowerCase();
      results = results.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }

    return results;
  }
}