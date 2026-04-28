import { Ok, Err, type Result } from "../lib/result";
import {
  ValidationError,
  type EventError,
  NotFoundError,
  InvalidTimeRangeError,
  InvalidCapacityError,
  NotAuthorizedError,
  InvalidStateError,
  InvalidSearchError,
} from "./errors";
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

export interface EventFilterInput {
  category?: string;
  timeframe?: "all" | "week" | "weekend";
  query?: string;
}

export interface IEventService {
  createEvent(input: CreateEventInput): Promise<Result<Event, EventError>>;
  updateEvent(
    eventId: string,
    input: Omit<CreateEventInput, "organizerId">,
    actingUserId: string
  ): Promise<Result<Event, EventError>>;
  getEventById(
    eventId: string,
    actingUserId?: string
  ): Promise<Result<Event, EventError>>;
  publishEvent(
    eventId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Result<Event, EventError>>;
  cancelEvent(
    eventId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Result<Event, EventError>>;
  listPublishedEvents(
    filters: EventFilterInput
  ): Promise<Result<Event[], EventError>>;
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
      return Err(
        InvalidTimeRangeError("End time must be after start time.")
      );
    }

    if (input.capacity <= 0) {
      return Err(
        InvalidCapacityError("Capacity must be greater than 0.")
      );
    }

    const event: Event = {
      id: crypto.randomUUID(),
      title,
      description,
      location: input.location,
      category: input.category,
      status: "draft",
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
    actingUserId?: string
  ): Promise<Result<Event, EventError>> {
    const event = await this.repo.getEventById(eventId);

    if (!event) {
      return Err(NotFoundError("Event not found."));
    }

    if (event.status === "draft" && event.organizerId !== actingUserId) {
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

    if (
        !input ||
        typeof input !== "object" ||
        typeof input?.title !== "string" ||
        typeof input?.description !== "string" ||
        !(input?.startTime instanceof Date) ||
        Number.isNaN(input?.startTime?.getTime?.()) ||
        !(input?.endTime instanceof Date) ||
        Number.isNaN(input?.endTime?.getTime?.()) ||
        typeof input?.capacity !== "number" ||
        Number.isNaN(input?.capacity)
    ) {
        return Err(NotFoundError("Event not found."));
      }

    const title = input.title.trim()
    const description = input.description.trim()

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

  async listPublishedEvents(
    filters: EventFilterInput
  ): Promise<Result<Event[], EventError>> {
    const category = filters.category?.trim();
    const timeframe = filters.timeframe ?? "all";

    if (timeframe !== "all" && timeframe !== "week" && timeframe !== "weekend") {
      return Err(ValidationError("Invalid timeframe value."));
    }

    if (filters.query !== undefined && filters.query.length > 200) {
      return Err(InvalidSearchError("Search query must be 200 characters or fewer."));
    }

    const now = new Date();

    const repoFilters: {
      status: string;
      startAfter: Date;
      startBefore?: Date;
      category?: string;
      query?: string;
    } = { status: "published", startAfter: now };

    if (category) repoFilters.category = category;
    if (filters.query?.trim()) repoFilters.query = filters.query.trim();

    if (timeframe === "week") {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + 7);
      repoFilters.startBefore = endOfWeek;
    }

    let results = await this.repo.getAll(repoFilters);

    if (timeframe === "weekend") {
      results = results.filter((event) => {
        const day = event.startDatetime.getDay();
        return day === 0 || day === 6;
      });
    }

    return Ok(results);
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

    if (!event) {
      return Err(NotFoundError("Event not found."));
    }

    if (!this.canModify(event, userId, userRole)) {
      return Err(
        NotAuthorizedError(
          "Only the organizer or an admin can publish this event."
        )
      );
    }

    if (event.status !== "draft") {
      return Err(
        InvalidStateError(
          `Cannot publish an event with status "${event.status}".`
        )
      );
    }

    const updated = await this.repo.update({
      ...event,
      status: "published",
      updatedAt: new Date(),
    });

    return Ok(updated);
  }

  async cancelEvent(
    eventId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Result<Event, EventError>> {
    const event = await this.repo.getEventById(eventId);

    if (!event) {
      return Err(NotFoundError("Event not found."));
    }

    if (!this.canModify(event, userId, userRole)) {
      return Err(
        NotAuthorizedError(
          "Only the organizer or an admin can cancel this event."
        )
      );
    }

    if (event.status !== "published") {
      return Err(
        InvalidStateError(
          `Cannot cancel an event with status "${event.status}".`
        )
      );
    }

    const updated = await this.repo.update({
      ...event,
      status: "cancelled",
      updatedAt: new Date(),
    });

    return Ok(updated);
  }
}

export function CreateEventService(
  repo: EventRepository
): IEventService {
  return new EventService(repo);
}
