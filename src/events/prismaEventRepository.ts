import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, EventStatus } from "@prisma/client";
import { EventRepository } from "./eventRepository";
import { Event } from "./event";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

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

  async getAll(filters?: {
    status?: string;
    category?: string;
    startAfter?: Date;
    startBefore?: Date;
  }): Promise<Event[]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status as EventStatus;
    }
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.startAfter || filters?.startBefore) {
      where.startDatetime = {
        ...(filters.startAfter && { gte: filters.startAfter }),
        ...(filters.startBefore && { lte: filters.startBefore }),
      };
    }

    const events = await prisma.event.findMany({ where });
    return events.map(toDomain);
  }

  async getEventById(eventId: string): Promise<Event | null> {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    return event ? toDomain(event) : null;
  }

  async getEventsByIds(eventIds: string[]): Promise<Event[]> {
    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } },
    });
    return events.map(toDomain);
  }

  async getEventsByOrganizerId(organizerId: string): Promise<Event[]> {
    const events = await prisma.event.findMany({
      where: { organizerId },
    });
    return events.map(toDomain);
  }
}