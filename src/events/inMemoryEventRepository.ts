import { Event } from "./event";
import { EventRepository } from "./eventRepository";

export class InMemoryEventRepository implements EventRepository {
  private events = new Map<string, Event>();

  async create(event: Event): Promise<Event> {
    this.events.set(event.id, event);
    return event;
  }

  async findById(id: string): Promise<Event | null> {
    return this.events.get(id) || null;
  }
}