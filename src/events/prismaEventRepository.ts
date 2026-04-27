import "dotenv/config";
import { PrismaClient, EventStatus } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { EventRepository, EventRepoFilter } from "./eventRepository";
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

  async getAll(filters?: EventRepoFilter): Promise<Event[]> {
    const where: any = {};

    if (filters?.status) where.status = filters.status as EventStatus;
    if (filters?.category) where.category = filters.category;
    if (filters?.startAfter || filters?.startBefore) {
      where.startDatetime = {
        ...(filters.startAfter && { gte: filters.startAfter }),
        ...(filters.startBefore && { lte: filters.startBefore }),
      };
    }
    if (filters?.query?.trim()) {
      const q = filters.query.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } },
      ];
    }

    const events = await prisma.event.findMany({ where });
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