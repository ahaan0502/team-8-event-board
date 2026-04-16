import type { Rsvp } from "./rsvp";

export interface RsvpRepository {
  findByEventId(eventId: string): Promise<Rsvp[]>;
  findByUserId(userId: string): Promise<Rsvp[]>;
  findByEventAndUser(eventId: string, userId: string): Promise<Rsvp | null>;
  create(rsvp: Rsvp): Promise<Rsvp>;
  update(rsvp: Rsvp): Promise<Rsvp>;
}
