import { Event } from "./event";

export interface EventRepository {
  create(event: Event): Promise<Event>;
  findById(id: string): Promise<Event | null>;
}