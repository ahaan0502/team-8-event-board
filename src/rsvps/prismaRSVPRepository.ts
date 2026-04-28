import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import type { RSVP, RSVPRepository } from "../events/rsvpRepository";

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

// simple type to avoid prisma type issues
type PrismaRsvp = {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  createdAt: Date;
};

function toDomain(rsvp: PrismaRsvp): RSVP {
  return {
    id: rsvp.id,
    eventId: rsvp.eventId,
    userId: rsvp.userId,
    status: rsvp.status as RSVP["status"],
    createdAt: rsvp.createdAt,
  };
}

export class PrismaRSVPRepository implements RSVPRepository {
  async getByEventAndUser(eventId: string, userId: string): Promise<RSVP | null> {
    const rsvp = await prisma.rsvp.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });
    return rsvp ? toDomain(rsvp as PrismaRsvp) : null;
  }

  async getByEvent(eventId: string): Promise<RSVP[]> {
    const rsvps = await prisma.rsvp.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });
    return rsvps.map((r) => toDomain(r as PrismaRsvp));
  }

  async create(rsvp: RSVP): Promise<RSVP> {
    const created = await prisma.rsvp.create({
      data: {
        eventId: rsvp.eventId,
        userId: rsvp.userId,
        status: rsvp.status,
        createdAt: rsvp.createdAt,
      },
    });
    return toDomain(created as PrismaRsvp);
  }

  async update(rsvp: RSVP): Promise<RSVP> {
    const updated = await prisma.rsvp.update({
      where: { id: rsvp.id },
      data: {
        status: rsvp.status,
      },
    });
    return toDomain(updated as PrismaRsvp);
  }
}