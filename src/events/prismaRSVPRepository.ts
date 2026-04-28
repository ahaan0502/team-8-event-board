import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import type { RSVPRepository, RSVP, RSVPStatus } from "./rsvpRepository";

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

function toDomain(row: { id: string; eventId: string; userId: string; status: string; createdAt: Date }): RSVP {
  return {
    id: row.id,
    eventId: row.eventId,
    userId: row.userId,
    status: row.status as RSVPStatus,
    createdAt: row.createdAt,
  };
}

export class PrismaRSVPRepository implements RSVPRepository {
  async getByEventAndUser(eventId: string, userId: string): Promise<RSVP | null> {
    const row = await prisma.rsvp.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    return row ? toDomain(row) : null;
  }

  async getByEvent(eventId: string): Promise<RSVP[]> {
    const rows = await prisma.rsvp.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toDomain);
  }

  async create(rsvp: RSVP): Promise<RSVP> {
    const row = await prisma.rsvp.create({
      data: {
        eventId: rsvp.eventId,
        userId: rsvp.userId,
        status: rsvp.status,
        createdAt: rsvp.createdAt,
        ...(rsvp.id ? { id: rsvp.id } : {}),
      },
    });
    return toDomain(row);
  }

  async update(rsvp: RSVP): Promise<RSVP> {
    const row = await prisma.rsvp.update({
      where: { id: rsvp.id },
      data: { status: rsvp.status },
    });
    return toDomain(row);
  }
}
