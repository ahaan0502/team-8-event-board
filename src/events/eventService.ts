import { Ok, Err, type Result } from "../lib/result";
import { ValidationError, type EventError } from "./errors";
import { Event } from "./event";
import type { EventRepository } from "./eventRepository";

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
  updateEvent(eventId: string, input: Omit<CreateEventInput, "organizerId">, actingUserId: string): Promise<Result<Event, EventError>>;
}

class EventService implements IEventService {
  constructor(private readonly repo: EventRepository) {}

  async createEvent(
    input: CreateEventInput
  ): Promise<Result<Event, EventError>> {
    const title = input.title.trim();
    const description = input.description.trim();

    // Validation
    if (!title) {
      return Err(ValidationError("Title is required."));
    }

    if (!description) {
      return Err(ValidationError("Description is required."));
    }

    if (input.endTime <= input.startTime) {
      return Err(
        ValidationError("End time must be after start time.")
      );
    }

    if (input.capacity <= 0) {
      return Err(
        ValidationError("Capacity must be greater than 0.")
      );
    }

    // Create event
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
    };

    const created = await this.repo.create(event);

    return Ok(created);
  }

  async updateEvent(
    eventId: string,
    input: Omit<CreateEventInput, "organizerId">,
    actingUserId: string): Promise<Result<Event, EventError>> {
      const event = await this.repo.getEventById(eventId);

      if (!event) {
        return Err(ValidationError("Event not found"));
      }
      if (event.organizerId !== actingUserId) {
        return Err(ValidationError("Not authorized to edit this event"));
      }
      if (event.status === "cancelled" || event.status === "past") {
        return Err(ValidationError("Cannot edit this event"));
      }
      const validation = await this.createEvent({
        ...input,
        organizerId: event.organizerId,
      });

      if (!validation.ok) {
        return validation;
      }

      const updated: Event = {
        ...event,
        ...input,
      };

      const saved = await this.repo.update(updated);

      return Ok(saved);
    } 
}

export function CreateEventService(
  repo: EventRepository
): IEventService {
  return new EventService(repo);
}