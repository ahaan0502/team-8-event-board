import { Ok, Err, type Result } from "../lib/result";
import { ValidationError, NotFoundError, NotAuthorizedError, InvalidStateError, type EventError } from "./errors";
import { Event } from "./event";
import type { EventRepository } from "./eventRepository";
import type { UserRole } from "../auth/User";

export interface CreateEventInput {
  title: string;
  description: string;
  location: string;
  category: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  organizerId: string;
}

export interface IEventService {
  createEvent(input: CreateEventInput): Promise<Result<Event, EventError>>;
  getEventById(eventId: string): Promise<Result<Event, EventError>>;
  publishEvent(eventId: string, userId: string, userRole: UserRole): Promise<Result<Event, EventError>>;
  cancelEvent(eventId: string, userId: string, userRole: UserRole): Promise<Result<Event, EventError>>;
}

class EventService implements IEventService {
  constructor(private readonly repo: EventRepository) {}

  async createEvent(
    input: CreateEventInput
  ): Promise<Result<Event, EventError>> {
    const title = input.title.trim();
    const description = input.description.trim();

    if (!title) {
      return Err(ValidationError("Title is required."));
    }

    if (!description) {
      return Err(ValidationError("Description is required."));
    }

    if (input.endTime <= input.startTime) {
      return Err(ValidationError("End time must be after start time."));
    }

    if (input.capacity <= 0) {
      return Err(ValidationError("Capacity must be greater than 0."));
    }

    const now = new Date();
    const event: Event = {
      id: crypto.randomUUID(),
      title,
      description,
      location: input.location,
      category: input.category,
      startTime: input.startTime,
      endTime: input.endTime,
      capacity: input.capacity,
      organizerId: input.organizerId,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.repo.create(event);
    return Ok(created);
  }

  async getEventById(eventId: string): Promise<Result<Event, EventError>> {
    const event = await this.repo.findById(eventId);
    if (!event) {
      return Err(NotFoundError("Event not found."));
    }
    return Ok(event);
  }

  async publishEvent(
    eventId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Result<Event, EventError>> {
    const event = await this.repo.findById(eventId);
    if (!event) {
      return Err(NotFoundError("Event not found."));
    }

    if (userRole !== "admin" && event.organizerId !== userId) {
      return Err(NotAuthorizedError("Only the organizer or an admin can publish this event."));
    }

    if (event.status !== "draft") {
      return Err(InvalidStateError(`Cannot publish an event with status "${event.status}".`));
    }

    const updated = await this.repo.update({ ...event, status: "published", updatedAt: new Date() });
    return Ok(updated);
  }

  async cancelEvent(
    eventId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Result<Event, EventError>> {
    const event = await this.repo.findById(eventId);
    if (!event) {
      return Err(NotFoundError("Event not found."));
    }

    if (userRole !== "admin" && event.organizerId !== userId) {
      return Err(NotAuthorizedError("Only the organizer or an admin can cancel this event."));
    }

    if (event.status !== "published") {
      return Err(InvalidStateError(`Cannot cancel an event with status "${event.status}".`));
    }

    const updated = await this.repo.update({ ...event, status: "cancelled", updatedAt: new Date() });
    return Ok(updated);
  }
}

export function CreateEventService(
  repo: EventRepository
): IEventService {
  return new EventService(repo);
}
