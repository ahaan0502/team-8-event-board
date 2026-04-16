import { Event } from "./event";
import { EventRepository } from "./eventRepository";

export class InMemoryEventRepository implements EventRepository {
  private readonly events: Event[] = [
    {
      id: "1",
      title: "Campus Music Night",
      description: "Live student performances and open mic.",
      location: "Student Union",
      category: "Music",
      startDatetime: new Date("2026-04-20T18:00:00"),
      endDatetime: new Date("2026-04-20T20:00:00"),
      capacity: 100,
      organizerId: "user-1",
      status: "published",
      createdAt: new Date("2026-04-09T09:00:00"),
      updatedAt: new Date("2026-04-09T09:00:00"),
    },
    {
      id: "2",
      title: "Hackathon Kickoff",
      description: "Intro session for all participants.",
      location: "Engineering Hall",
      category: "Tech",
      startDatetime: new Date("2026-04-22T17:00:00"),
      endDatetime: new Date("2026-04-22T19:00:00"),
      capacity: 150,
      organizerId: "user-2",
      status: "published",
      createdAt: new Date("2026-04-09T10:00:00"),
      updatedAt: new Date("2026-04-09T10:00:00"),
    },
    {
      id: "3",
      title: "Private Planning Meeting",
      description: "Draft event for organizers only.",
      location: "Room 101",
      category: "Planning",
      startDatetime: new Date("2026-04-23T10:00:00"),
      endDatetime: new Date("2026-04-23T11:00:00"),
      capacity: 10,
      organizerId: "user-3",
      status: "draft",
      createdAt: new Date("2026-04-09T11:00:00"),
      updatedAt: new Date("2026-04-09T11:00:00"),
    },
  ];

  async getAll(): Promise<Event[]> {
    return this.events;
  }
}