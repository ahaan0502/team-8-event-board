import type { RSVP } from './RSVP'
import type { RSVPRepository } from './RSVPRepository'

const rsvps = new Map<string, RSVP>()

const sampleRsvps: RSVP[] = [
    {
      id: 'rsvp-1',
      eventId: 'event-1',
      userId: 'user@app.test',
      status: 'going',
      createdAt: new Date(),
    },
  ]
  
  sampleRsvps.forEach(rsvp => rsvps.set(rsvp.id, rsvp))

export class InMemoryRSVPRepository implements RSVPRepository {
  async findByUserId(userId: string): Promise<RSVP[]> {
    return Array.from(rsvps.values()).filter((rsvp) => rsvp.userId === userId)
  }

  async findByEventId(eventId: string): Promise<RSVP[]> {
    return Array.from(rsvps.values()).filter((rsvp) => rsvp.eventId === eventId)
  }

  async save(rsvp: RSVP): Promise<void> {
    rsvps.set(rsvp.id, rsvp)
  }
}