import { Ok, Err, type Result } from "../lib/result";
import { NotFoundError, UnauthorizedError, ValidationError, type EventError } from "./errors";
import type { RSVPRepository, RSVP } from "./rsvpRepository";
import type { EventRepository } from "./eventRepository";

export interface IRSVPService {
  toggleRSVP(
    eventId: string,
    userId: string
  ): Promise<Result<RSVP, EventError>>;
}

class RSVPService implements IRSVPService {
  constructor(
    private readonly rsvpRepo: RSVPRepository,
    private readonly eventRepo: EventRepository
  ) {}

  async toggleRSVP(
  eventId: string,
  userId: string
): Promise<Result<RSVP, EventError>> {
  const event = await this.eventRepo.getEventById(eventId);

  if (!event) {
    return Err(NotFoundError("Event not found"));
  }

  /*// Organizer cannot RSVP
  if (event.organizerId === userId) {
    return Err(UnauthorizedError("Organizer cannot RSVP"));
  }*/

  // Cannot RSVP to invalid events
  if (event.status === "cancelled" || event.status === "past") {
    return Err(ValidationError("Cannot RSVP to this event"));
  }

  const existing = await this.rsvpRepo.getByEventAndUser(eventId, userId);

  const all = await this.rsvpRepo.getByEvent(eventId);
  const goingCount = all.filter((r) => r.status === "going").length;

  const capacity = event.capacity ?? 0;
  const isFull = goingCount >= capacity;

  // CASE 1: No RSVP yet
  if (!existing) {
    const status = isFull ? "waitlisted" : "going";

    const created = await this.rsvpRepo.create({
      id: "",
      eventId,
      userId,
      status,
      createdAt: new Date(),
    });

    return Ok(created);
  }

  // CASE 2: going → cancelled
  if (existing.status === "going") {
    existing.status = "cancelled";
    const updated = await this.rsvpRepo.update(existing);
    return Ok(updated);
  }

  // CASE 3: cancelled → reactivated
  if (existing.status === "cancelled") {
    existing.status = isFull ? "waitlisted" : "going";
    const updated = await this.rsvpRepo.update(existing);
    return Ok(updated);
  }

  // CASE 4: waitlisted → cancelled (safe fallback)
  if (existing.status === "waitlisted") {
    existing.status = "cancelled";
    const updated = await this.rsvpRepo.update(existing);
    return Ok(updated);
  }

  return Ok(existing);
}
}

export function CreateRSVPService(
  rsvpRepo: RSVPRepository,
  eventRepo: EventRepository
): IRSVPService {
  return new RSVPService(rsvpRepo, eventRepo);
}