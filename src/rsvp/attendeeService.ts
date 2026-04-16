import { Ok, Err, type Result } from "../lib/result";
import type { RsvpRepository } from "./rsvpRepository";
import type { Rsvp, RsvpStatus } from "./rsvp";
import type { IEventService } from "../events/eventService";
import type { IUserRepository } from "../auth/UserRepository";
import type { UserRole } from "../auth/User";
import { NotFoundError, NotAuthorizedError, type EventError } from "../events/errors";

export interface AttendeeEntry {
  userId: string;
  displayName: string;
  status: RsvpStatus;
  createdAt: Date;
}

export interface AttendeeList {
  going: AttendeeEntry[];
  waitlisted: AttendeeEntry[];
  cancelled: AttendeeEntry[];
}

export interface IAttendeeService {
  getAttendeeList(
    eventId: string,
    requesterId: string,
    requesterRole: UserRole
  ): Promise<Result<AttendeeList, EventError>>;
}

class AttendeeService implements IAttendeeService {
  constructor(
    private readonly rsvpRepo: RsvpRepository,
    private readonly userRepo: IUserRepository,
    private readonly eventService: IEventService
  ) {}

  async getAttendeeList(
    eventId: string,
    requesterId: string,
    requesterRole: UserRole
  ): Promise<Result<AttendeeList, EventError>> {
    const eventResult = await this.eventService.getEventById(eventId);
    if (eventResult.ok === false) {
      return Err(eventResult.value);
    }

    const event = eventResult.value;
    if (requesterRole !== "admin" && event.organizerId !== requesterId) {
      return Err(NotAuthorizedError("Only the organizer or an admin can view the attendee list."));
    }

    const rsvps = await this.rsvpRepo.findByEventId(eventId);
    const sorted = [...rsvps].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const list: AttendeeList = { going: [], waitlisted: [], cancelled: [] };

    for (const rsvp of sorted) {
      const userResult = await this.userRepo.findById(rsvp.userId);
      const displayName =
        userResult.ok && userResult.value
          ? userResult.value.displayName
          : "Unknown User";

      const entry: AttendeeEntry = {
        userId: rsvp.userId,
        displayName,
        status: rsvp.status,
        createdAt: rsvp.createdAt,
      };

      list[rsvp.status].push(entry);
    }

    return Ok(list);
  }
}

export function CreateAttendeeService(
  rsvpRepo: RsvpRepository,
  userRepo: IUserRepository,
  eventService: IEventService
): IAttendeeService {
  return new AttendeeService(rsvpRepo, userRepo, eventService);
}
