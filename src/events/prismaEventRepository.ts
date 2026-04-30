import { PrismaClient, EventStatus } from "@prisma/client";
import { EventRepository } from "./eventRepository";
import { Event } from "./event";

const prisma = new PrismaClient();

function toDomain(event: any): Event {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    category: event.category,
    status: event.status as Event["status"],
    capacity: event.capacity ?? undefined,
    startDatetime: event.startDatetime,
    endDatetime: event.endDatetime,
    organizerId: event.organizerId,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export class PrismaEventRepository implements EventRepository {
  async create(event: Event): Promise<Event> {
    const created = await prisma.event.create({
      data: {
        id: event.id,

        title: event.title,
        description: event.description,
        location: event.location,
        category: event.category,

        status: event.status as EventStatus,
        capacity: event.capacity ?? null,

        startDatetime: event.startDatetime,
        endDatetime: event.endDatetime,

        organizerId: event.organizerId,

        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
    });

    return toDomain(created);
  }

  async update(event: Event): Promise<Event> {
    const updated = await prisma.event.update({
      where: { id: event.id },
      data: {
        title: event.title,
        description: event.description,
        location: event.location,
        category: event.category,

        status: event.status as EventStatus,
        capacity: event.capacity ?? null,

        startDatetime: event.startDatetime,
        endDatetime: event.endDatetime,

        updatedAt: event.updatedAt,
      },
    });

    return toDomain(updated);
  }

  async getAll(): Promise<Event[]> {
    const events = await prisma.event.findMany();
    return events.map(toDomain);
  }

  async getEventById(): Promise<Event | null> {
    throw new Error("Not implemented yet");
  }

  async getEventsByIds(): Promise<Event[]> {
    throw new Error("Not implemented yet");
  }

  async getEventsByOrganizerId(): Promise<Event[]> {
    throw new Error("Not implemented yet");
  }
}