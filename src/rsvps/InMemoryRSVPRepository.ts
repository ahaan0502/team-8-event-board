import type { RSVP } from './RSVP'
import type { RSVPRepository } from '../events/rsvpRepository'

const rsvps = new Map<string, RSVP>()

const sampleRsvps: RSVP[] = [
  {
    id: 'rsvp-1',
    eventId: 'event-1',
    userId: 'user-reader',
    status: 'going',
    createdAt: new Date(),
  },
  {
    id: 'rsvp-2',
    eventId: 'event-2',
    userId: 'user-reader',
    status: 'waitlisted',
    createdAt: new Date(),
  },
  {
    id: 'rsvp-3',
    eventId: 'event-3',
    userId: 'user-reader',
    status: 'cancelled',
    createdAt: new Date(),
  },
]

sampleRsvps.forEach(rsvp => rsvps.set(rsvp.id, rsvp))

export class InMemoryRSVPRepository implements RSVPRepository {

  // ===== TOGGLE METHODS =====

  async getByEventAndUser(eventId: string, userId: string): Promise<RSVP | null> {
    for (const rsvp of rsvps.values()) {
      if (rsvp.eventId === eventId && rsvp.userId === userId) {
        return rsvp
      }
    }
    return null
  }

  async getByEvent(eventId: string): Promise<RSVP[]> {
    return Array.from(rsvps.values()).filter(
      (rsvp) => rsvp.eventId === eventId
    )
  }

  async create(rsvp: RSVP): Promise<RSVP> {
    rsvps.set(rsvp.id, rsvp)
    return rsvp
  }

  async update(rsvp: RSVP): Promise<RSVP> {
    rsvps.set(rsvp.id, rsvp)
    return rsvp
  }

  // ===== DASHBOARD METHODS =====

  async findByUserId(userId: string): Promise<RSVP[]> {
    return Array.from(rsvps.values()).filter(
      (rsvp) => rsvp.userId === userId
    )
  }

  async findByEventId(eventId: string): Promise<RSVP[]> {
    return Array.from(rsvps.values()).filter(
      (rsvp) => rsvp.eventId === eventId
    )
  }

  async save(rsvp: RSVP): Promise<void> {
    rsvps.set(rsvp.id, rsvp)
  }
}