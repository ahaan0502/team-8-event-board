import { EventRepository } from "./eventRepository";
import { Event } from "./event";
import { Result } from "../lib/result";
import { InvalidEventInputError } from "./errors";

export class EventService {
  constructor(private repo: EventRepository) {}

  async createEvent(input: {
    title: string;
    description: string;
    location: string;
    category: string;
    startTime: Date;
    endTime: Date;
    capacity: number;
    organizerId: string;
  }): Promise<Result<Event, Error>> {
    
    if (!input.title || !input.description) {
  return { ok: false, error: new InvalidEventInputError("Missing required fields") };
}

if (input.endTime <= input.startTime) {
  return { ok: false, error: new InvalidEventInputError("End time must be after start time") };
}

if (input.capacity <= 0) {
  return { ok: false, error: new InvalidEventInputError("Capacity must be greater than 0") };
}
  }
}