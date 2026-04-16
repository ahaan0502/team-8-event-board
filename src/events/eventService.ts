import { Ok, Err, type Result } from "../lib/result";
import { Event } from "./event";
import type { EventRepository } from "./eventRepository";

export interface EventQuery {
  q?: string;
  category?: string;
  date?: string;
}

export type EventError =
  | { type: "ValidationError"; message: string };

function ValidationError(message: string): EventError {
  return { type: "ValidationError", message };
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface IEventService {
  listEvents(filters: EventQuery): Promise<Result<Event[], EventError>>;
}

class EventService implements IEventService {
  constructor(private readonly repo: EventRepository) {}

  async listEvents(
    filters: EventQuery
  ): Promise<Result<Event[], EventError>> {
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
        return Err(ValidationError("Invalid date format."));
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


    filtered.sort(
      (a, b) => a.startDatetime.getTime() - b.startDatetime.getTime()
    );

    return Ok(filtered);
  }
}

export function createEventService(repo: EventRepository): IEventService {
  return new EventService(repo);
}