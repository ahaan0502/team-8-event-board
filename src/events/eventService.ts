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
    // validation + creation goes here
  }
}