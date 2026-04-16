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
}