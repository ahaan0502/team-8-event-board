import { Ok, Err, type Result } from "../lib/result";
import { ValidationError, type EventError } from "./errors";
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
    return Err(ValidationError("Not implemented"));
  }
}

export function CreateRSVPService(
  rsvpRepo: RSVPRepository,
  eventRepo: EventRepository
): IRSVPService {
  return new RSVPService(rsvpRepo, eventRepo);
}