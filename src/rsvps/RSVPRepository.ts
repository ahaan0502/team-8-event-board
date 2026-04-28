import type { RSVP } from './RSVP'
import type { Event } from '../events/event'

export interface RSVPDashboardRow {
  rsvp: RSVP
  event: Event
}

export interface RSVPRepository {
  findByUserId(userId: string): Promise<RSVP[]>
  findByEventId(eventId: string): Promise<RSVP[]>
  save(rsvp: RSVP): Promise<void>
  findDashboardRowsByUserId?(userId: string): Promise<RSVPDashboardRow[]>
  countGoingByEventIds?(eventIds: string[]): Promise<Map<string, number>>
}