import type { RSVP } from './RSVP'

export interface RSVPRepository {
  findByUserId(userId: string): Promise<RSVP[]>
  findByEventId(eventId: string): Promise<RSVP[]>
  save(rsvp: RSVP): Promise<void>
}