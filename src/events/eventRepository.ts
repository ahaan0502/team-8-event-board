import { Event } from "./event";

export interface EventRepository {
  getAll(): Promise<Event[]>;
}