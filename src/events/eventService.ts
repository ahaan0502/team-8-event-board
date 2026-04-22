import { Ok, Err, type Result } from "../lib/result";
import {
  ValidationError,
  NotFoundError,
  InvalidTimeRangeError,
  InvalidCapacityError,
  NotAuthorizedError,
  InvalidStateError,
  InvalidFilterError,
  type EventError,
} from "./errors";
import { Event } from "./event";
import type { EventRepository } from "./eventRepository";
import type { UserRole } from "../auth/User";

export interface EventQuery {
  q?: string;
  category?: string;
  date?: string;
}

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

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface IEventService {
  listEvents(filters: EventQuery): Promise<Result<Event[], EventError>>;
  createEvent(input: CreateEventInput): Promise<Result<Event, EventError>>;
  updateEvent(eventId: string, input: Omit<CreateEventInput, "organizerId">, actingUserId: string): Promise<Result<Event, EventError>>;
  getEventById(eventId: string, actingUserId?: string): Promise<Result<Event, EventError>>;
  publishEvent(eventId: string, userId: string, userRole: UserRole): Promise<Result<Event, EventError>>;
  cancelEvent(eventId: string, userId: string, userRole: UserRole): Promise<Result<Event, EventError>>;
}

class EventService implements IEventService {
  constructor(private readonly repo: EventRepository) {}

  async listEvents(filters: EventQuery): Promise<Result<Event[], EventError>> {
    const events = await this.repo.getAll();
    const now = new Date();

    let filtered = events.filter((event) => {
      return event.status === "published" && event.startDatetime >= now;
    });

    if (filters.category && filters.category.trim() !== "") {
      const category = filters.category.trim().toLowerCase();
      filtered = filtered.filter((event) => {
        return event.category.toLowerCase() === category;
      });
    }

    if (filters.date && filters.date.trim() !== "") {
      const requestedDate = filters.date.trim();
      const parsed = new Date(requestedDate);

      if (Number.isNaN(parsed.getTime())) {
        return Err(InvalidFilterError("Invalid date format."));
      }

      filtered = filtered.filter((event) => {
        return toLocalDateString(event.startDatetime) === requestedDate;
      });
    }

    if (filters.q && filters.q.trim() !== "") {
      const q = filters.q.trim().toLowerCase();
      filtered = filtered.filter((event) => {
        return (
          event.title.toLowerCase().includes(q) ||
          event.description.toLowerCase().includes(q) ||
          event.location.toLowerCase().includes(q) ||
          event.category.toLowerCase().includes(q)
        );
      });
    }

    filtered.sort((a, b) => a.startDatetime.getTime() - b.startDatetime.getTime());

    return Ok(filtered);
  }

  async createEvent(input: CreateEventInput): Promise<Result<Event, EventError>> {
    const title = input.title.trim();
    const description = input.description.trim();

    if (!title) {
      return Err(ValidationError("Title is required."));
    }

    if (!description) {
      return Err(ValidationError("Description is required."));
    }

    if (input.endTime <= input.startTime) {
      return Err(InvalidTimeRangeError("End time must be after start time."));
    }

    if (input.capacity <= 0) {
      return Err(InvalidCapacityError("Capacity must be greater than 0."));
    }

    const event: Event = {
      id: crypto.randomUUID(),
      title,
      description,
      location: input.location,
      category: input.category,
      status: 'draft',
      capacity: input.capacity,
      startDatetime: input.startTime,
      endDatetime: input.endTime,
      organizerId: input.organizerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.repo.create(event);
    return Ok(created);
  }

  async getEventById(
    eventId: string,
    _actingUserId?: string
  ): Promise<Result<Event, EventError>> {
    const event = await this.repo.getEventById(eventId);

    if (!event) {
      return Err(NotFoundError("Event not found."));
    }

    return Ok(event);
  }

  async updateEvent(
    eventId: string,
    input: Omit<CreateEventInput, "organizerId">,
    actingUserId: string
  ): Promise<Result<Event, EventError>> {
    const event = await this.repo.getEventById(eventId);

    if (!event) {
      return Err(NotFoundError("Event not found."));
    }

    if (event.organizerId !== actingUserId) {
      return Err(ValidationError("Not authorized to edit this event."));
    }

    if (event.status === "cancelled" || event.status === "past") {
      return Err(ValidationError("Cannot edit this event."));
    }

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

    const updated: Event = {
      ...event,
      title,
      description,
      location: input.location,
      category: input.category,
      capacity: input.capacity,
      startDatetime: input.startTime,
      endDatetime: input.endTime,
      updatedAt: new Date(),
    };

    const saved = await this.repo.update(updated);
    return Ok(saved);
  }

  private canModify(event: Event, userId: string, userRole: UserRole): boolean {
    return userRole === "admin" || event.organizerId === userId;
  }

  async publishEvent(
    eventId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Result<Event, EventError>> {
    const event = await this.repo.getEventById(eventId);
    if (!event) return Err(NotFoundError("Event not found."));
    if (!this.canModify(event, userId, userRole))
      return Err(NotAuthorizedError("Only the organizer or an admin can publish this event."));
    if (event.status !== "draft")
      return Err(InvalidStateError(`Cannot publish an event with status "${event.status}".`));
    const updated = await this.repo.update({ ...event, status: "published", updatedAt: new Date() });
    return Ok(updated);
  }

  async cancelEvent(
    eventId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Result<Event, EventError>> {
    const event = await this.repo.getEventById(eventId);
    if (!event) return Err(NotFoundError("Event not found."));
    if (!this.canModify(event, userId, userRole))
      return Err(NotAuthorizedError("Only the organizer or an admin can cancel this event."));
    if (event.status !== "published")
      return Err(InvalidStateError(`Cannot cancel an event with status "${event.status}".`));
    const updated = await this.repo.update({ ...event, status: "cancelled", updatedAt: new Date() });
    return Ok(updated);
  }
}

export function CreateEventService(repo: EventRepository): IEventService {
  return new EventService(repo);
}
