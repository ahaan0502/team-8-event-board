import type { Rsvp } from "./rsvp";
import type { RsvpRepository } from "./rsvpRepository";

class InMemoryRsvpRepository implements RsvpRepository {
  private rsvps = new Map<string, Rsvp>();

  async findByEventId(eventId: string): Promise<Rsvp[]> {
    return [...this.rsvps.values()].filter((r) => r.eventId === eventId);
  }

  async findByUserId(userId: string): Promise<Rsvp[]> {
    return [...this.rsvps.values()].filter((r) => r.userId === userId);
  }

  async findByEventAndUser(eventId: string, userId: string): Promise<Rsvp | null> {
    return (
      [...this.rsvps.values()].find(
        (r) => r.eventId === eventId && r.userId === userId
      ) ?? null
    );
  }

  async create(rsvp: Rsvp): Promise<Rsvp> {
    this.rsvps.set(rsvp.id, rsvp);
    return rsvp;
  }

  async update(rsvp: Rsvp): Promise<Rsvp> {
    if (!this.rsvps.has(rsvp.id)) {
      throw new Error(`RSVP ${rsvp.id} not found`);
    }
    this.rsvps.set(rsvp.id, rsvp);
    return rsvp;
  }
}

export function CreateInMemoryRsvpRepository(): RsvpRepository {
  return new InMemoryRsvpRepository();
}
