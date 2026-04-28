import { randomUUID } from "crypto";

export type RSVPStatus = "going" | "waitlisted" | "cancelled";

export interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  status: RSVPStatus;
  createdAt: Date;
}

export interface RSVPRepository {
  getByEventAndUser(eventId: string, userId: string): Promise<RSVP | null>;
  getByEvent(eventId: string): Promise<RSVP[]>;
  create(rsvp: RSVP): Promise<RSVP>;
  update(rsvp: RSVP): Promise<RSVP>;
  findByUserId(userId: string): Promise<RSVP[]>;
  findByEventId(eventId: string): Promise<RSVP[]>;
  save(rsvp: RSVP): Promise<void>;
}

class InMemoryRSVPRepository implements RSVPRepository {
  private rsvps = new Map<string, RSVP>();

  async getByEventAndUser(eventId: string, userId: string) {
    for (const r of this.rsvps.values()) {
      if (r.eventId === eventId && r.userId === userId) return r;
    }
    return null;
  }

  async getByEvent(eventId: string) {
    return Array.from(this.rsvps.values()).filter(
      (r) => r.eventId === eventId
    );
  }

  async create(rsvp: RSVP) {
    const newRSVP = {
        ...rsvp,
        id: randomUUID(),
    };

    this.rsvps.set(newRSVP.id, newRSVP);
    return newRSVP;
  }

  async update(rsvp: RSVP) {
    this.rsvps.set(rsvp.id, rsvp);
    return rsvp;
  }
}

export function CreateRSVPRepository(): RSVPRepository {
  return new InMemoryRSVPRepository();
}