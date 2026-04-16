import { Result } from "../lib/result";
import type { RSVP } from "./rsvpRepository";
import type { EventError } from "./errors";

export interface IRSVPService {
  toggleRSVP(
    eventId: string,
    userId: string
  ): Promise<Result<RSVP, EventError>>;
}