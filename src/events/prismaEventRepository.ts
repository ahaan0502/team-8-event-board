import { EventStatus } from "@prisma/client";
import { EventRepository } from "./eventRepository";
import { Event } from "./event";
import { ensureTestDemoFixture, getPrisma } from "./prismaClient";

export function eventRecordToDomain(event: {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  status: Event["status"];
  capacity: number | null;
  startDatetime: Date;
  endDatetime: Date;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
}): Event {
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
    await ensureTestDemoFixture();
    const prisma = getPrisma();
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

    return eventRecordToDomain(created);
  }

  async update(event: Event): Promise<Event> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
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

    return eventRecordToDomain(updated);
  }

  async getAll(): Promise<Event[]> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
    const events = await prisma.event.findMany();
    return events.map(eventRecordToDomain);
  }

  async getEventById(eventId: string): Promise<Event | null> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
    const row = await prisma.event.findUnique({ where: { id: eventId } });
    return row ? eventRecordToDomain(row) : null;
  }

  async getEventsByIds(eventIds: string[]): Promise<Event[]> {
    await ensureTestDemoFixture();
    if (eventIds.length === 0) {
      return [];
    }
    const prisma = getPrisma();
    const events = await prisma.event.findMany({
      where: { id: { in: [...new Set(eventIds)] } },
    });
    return events.map(eventRecordToDomain);
  }

  async getEventsByOrganizerId(organizerId: string): Promise<Event[]> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
    const events = await prisma.event.findMany({
      where: { organizerId },
    });
    return events.map(eventRecordToDomain);
  }
}
