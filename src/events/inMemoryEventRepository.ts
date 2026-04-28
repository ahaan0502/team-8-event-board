import { Event } from './event'
import { EventRepository, EventRepoFilter } from './eventRepository'

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

const sampleEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Hack Night',
    description: 'Build together and practice coding.',
    location: 'CS Building',
    category: 'Tech',
    status: 'published',
    capacity: 20,
    startDatetime: daysFromNow(7),
    endDatetime: daysFromNow(8),
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
    startDatetime: daysFromNow(10),
    endDatetime: daysFromNow(11),
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
    startDatetime: daysFromNow(14),
    endDatetime: daysFromNow(15),
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
    let result = Array.from(events.values());

    if (filters?.status) {
      result = result.filter((e) => e.status === filters.status);
    }
    if (filters?.category) {
      result = result.filter((e) => e.category === filters.category);
    }
    if (filters?.startAfter) {
      result = result.filter((e) => e.startDatetime >= filters.startAfter!);
    }
    if (filters?.startBefore) {
      result = result.filter((e) => e.startDatetime <= filters.startBefore!);
    }
    if (filters?.weekendOnly) {
      result = result.filter((e) => {
        const day = e.startDatetime.getDay();
        return day === 0 || day === 6;
      });
    }

    return result;
  }
}
