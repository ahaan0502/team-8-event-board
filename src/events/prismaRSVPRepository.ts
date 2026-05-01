import { randomUUID } from "node:crypto";
import { RSVPStatus } from "@prisma/client";
import { ensureTestDemoFixture, getPrisma } from "./prismaClient";
import { eventRecordToDomain } from "./prismaEventRepository";
import type {
  RSVP,
  RSVPDashboardRow,
  RSVPRepository,
} from "./rsvpRepository";

function rsvpRecordToDomain(row: {
  id: string;
  eventId: string;
  userId: string;
  status: RSVPStatus;
  createdAt: Date;
}): RSVP {
  return {
    id: row.id,
    eventId: row.eventId,
    userId: row.userId,
    status: row.status as RSVP["status"],
    createdAt: row.createdAt,
  };
}

export class PrismaRSVPRepository implements RSVPRepository {
  async findDashboardRowsByUserId(userId: string): Promise<RSVPDashboardRow[]> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
    const rows = await prisma.rsvp.findMany({
      where: { userId },
      include: { event: true },
      orderBy: [{ createdAt: "asc" }],
    });
    return rows.map((row) => ({
      rsvp: rsvpRecordToDomain(row),
      event: eventRecordToDomain(row.event),
    }));
  }

  async countGoingByEventIds(eventIds: string[]): Promise<Map<string, number>> {
    await ensureTestDemoFixture();
    const unique = [...new Set(eventIds)];
    const map = new Map<string, number>();
    for (const id of unique) {
      map.set(id, 0);
    }
    if (unique.length === 0) {
      return map;
    }
    const prisma = getPrisma();
    const grouped = await prisma.rsvp.groupBy({
      by: ["eventId"],
      where: {
        eventId: { in: unique },
        status: RSVPStatus.going,
      },
      _count: { _all: true },
    });
    for (const g of grouped) {
      map.set(g.eventId, g._count._all);
    }
    return map;
  }

  async getByEventAndUser(eventId: string, userId: string): Promise<RSVP | null> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
    const row = await prisma.rsvp.findFirst({
      where: { eventId, userId },
    });
    return row ? rsvpRecordToDomain(row) : null;
  }

  async getByEvent(eventId: string): Promise<RSVP[]> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
    const rows = await prisma.rsvp.findMany({ where: { eventId } });
    return rows.map(rsvpRecordToDomain);
  }

  async create(rsvp: RSVP): Promise<RSVP> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
    const id = rsvp.id?.trim() ? rsvp.id : randomUUID();
    const created = await prisma.rsvp.create({
      data: {
        id,
        eventId: rsvp.eventId,
        userId: rsvp.userId,
        status: rsvp.status as RSVPStatus,
        createdAt: rsvp.createdAt,
      },
    });
    return rsvpRecordToDomain(created);
  }

  async update(rsvp: RSVP): Promise<RSVP> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
    const updated = await prisma.rsvp.update({
      where: { id: rsvp.id },
      data: {
        eventId: rsvp.eventId,
        userId: rsvp.userId,
        status: rsvp.status as RSVPStatus,
      },
    });
    return rsvpRecordToDomain(updated);
  }

  async findByUserId(userId: string): Promise<RSVP[]> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
    const rows = await prisma.rsvp.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(rsvpRecordToDomain);
  }

  async findByEventId(eventId: string): Promise<RSVP[]> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
    const rows = await prisma.rsvp.findMany({ where: { eventId } });
    return rows.map(rsvpRecordToDomain);
  }

  async save(rsvp: RSVP): Promise<void> {
    await ensureTestDemoFixture();
    const prisma = getPrisma();
    const existing = await prisma.rsvp.findUnique({ where: { id: rsvp.id } });
    if (existing) {
      await prisma.rsvp.update({
        where: { id: rsvp.id },
        data: {
          eventId: rsvp.eventId,
          userId: rsvp.userId,
          status: rsvp.status as RSVPStatus,
        },
      });
      return;
    }
    await prisma.rsvp.create({
      data: {
        id: rsvp.id?.trim() ? rsvp.id : randomUUID(),
        eventId: rsvp.eventId,
        userId: rsvp.userId,
        status: rsvp.status as RSVPStatus,
        createdAt: rsvp.createdAt,
      },
    });
  }
}
