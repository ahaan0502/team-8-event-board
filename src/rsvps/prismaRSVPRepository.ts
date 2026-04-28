import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { RSVPRepository, RSVP } from "./rsvpRepository";

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

function toDomain(rsvp: any): RSVP {
  return {
    id: rsvp.id,
    eventId: rsvp.eventId,
    userId: rsvp.userId,
    status: rsvp.status,
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
    return rsvp ? toDomain(rsvp) : null;
  }

  async getByEvent(eventId: string): Promise<RSVP[]> {
    const rsvps = await prisma.rsvp.findMany({
      where: { eventId },
    });
    return rsvps.map(toDomain);
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
    return toDomain(created);
  }

  async update(rsvp: RSVP): Promise<RSVP> {
    const updated = await prisma.rsvp.update({
      where: { id: rsvp.id },
      data: {
        status: rsvp.status,
      },
    });
    return toDomain(updated);
  }
}