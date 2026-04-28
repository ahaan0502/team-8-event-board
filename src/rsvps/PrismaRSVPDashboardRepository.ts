import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import type { Event } from "../events/event";
import type { RSVP } from "./RSVP";
import type { RSVPDashboardRow, RSVPRepository } from "./RSVPRepository";

type PrismaRsvpRow = {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  createdAt: Date;
};

type PrismaEventRow = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  status: string;
  capacity: number | null;
  startDatetime: Date;
  endDatetime: Date;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
};

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

function toDomainRSVP(row: PrismaRsvpRow): RSVP {
  return {
    id: row.id,
    eventId: row.eventId,
    userId: row.userId,
    status: row.status as RSVP["status"],
    createdAt: row.createdAt,
  };
}

function toDomainEvent(row: PrismaEventRow): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    category: row.category,
    status: row.status as Event["status"],
    capacity: row.capacity ?? undefined,
    startDatetime: row.startDatetime,
    endDatetime: row.endDatetime,
    organizerId: row.organizerId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaRSVPDashboardRepository implements RSVPRepository {
  async findByUserId(userId: string): Promise<RSVP[]> {
    const rows = await prisma.rsvp.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toDomainRSVP);
  }

  async findByEventId(eventId: string): Promise<RSVP[]> {
    const rows = await prisma.rsvp.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toDomainRSVP);
  }

  async save(rsvp: RSVP): Promise<void> {
    await prisma.rsvp.upsert({
      where: { id: rsvp.id },
      update: {
        status: rsvp.status,
      },
      create: {
        id: rsvp.id,
        eventId: rsvp.eventId,
        userId: rsvp.userId,
        status: rsvp.status,
        createdAt: rsvp.createdAt,
      },
    });
  }

  async findDashboardRowsByUserId(userId: string): Promise<RSVPDashboardRow[]> {
    const rows = await prisma.rsvp.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { createdAt: "asc" },
    });

    return rows.map((row) => ({
      rsvp: toDomainRSVP(row),
      event: toDomainEvent(row.event as PrismaEventRow),
    }));
  }

  async countGoingByEventIds(eventIds: string[]): Promise<Map<string, number>> {
    if (eventIds.length === 0) {
      return new Map<string, number>();
    }

    const grouped = await prisma.rsvp.groupBy({
      by: ["eventId"],
      where: {
        eventId: { in: eventIds },
        status: "going",
      },
      _count: {
        _all: true,
      },
    });

    return new Map(grouped.map((row) => [row.eventId, row._count._all]));
  }
}
