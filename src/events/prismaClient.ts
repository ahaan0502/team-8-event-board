import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { EventStatus, PrismaClient, RSVPStatus } from "@prisma/client";

let prisma: PrismaClient | undefined;
let testFixturePromise: Promise<void> | undefined;

function databaseUrl(): string {
  return process.env.DATABASE_URL ?? "file:./prisma/dev.db";
}

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      adapter: new PrismaBetterSqlite3({ url: databaseUrl() }),
    });
  }
  return prisma;
}

/**
 * Seeds demo Event/Rsvp rows in Jest so Feature 7/8 integration tests match
 * the former in-memory fixtures (same ids and titles).
 */
export async function ensureTestDemoFixture(): Promise<void> {
  if (process.env.NODE_ENV !== "test") {
    return;
  }
  if (!testFixturePromise) {
    testFixturePromise = seedTestDemoData(getPrisma());
  }
  await testFixturePromise;
}

async function seedTestDemoData(client: PrismaClient): Promise<void> {
  const now = new Date();

  await client.rsvp.deleteMany();
  await client.event.deleteMany();

  const events = [
    {
      id: "event-1",
      title: "Hack Night",
      description: "Build together and practice coding.",
      location: "CS Building",
      category: "Tech",
      status: EventStatus.published,
      capacity: 20,
      startDatetime: new Date("2026-04-20T18:00:00"),
      endDatetime: new Date("2026-04-20T20:00:00"),
      organizerId: "user-staff",
    },
    {
      id: "event-2",
      title: "Club Social",
      description: "Casual meetup for members.",
      location: "Student Union",
      category: "Social",
      status: EventStatus.draft,
      capacity: 40,
      startDatetime: new Date("2026-04-22T17:00:00"),
      endDatetime: new Date("2026-04-22T19:00:00"),
      organizerId: "user-staff",
    },
    {
      id: "event-3",
      title: "Spring Concert",
      description: "Live music event.",
      location: "Campus Center",
      category: "Entertainment",
      status: EventStatus.published,
      capacity: 100,
      startDatetime: new Date("2026-04-25T19:00:00"),
      endDatetime: new Date("2026-04-25T21:00:00"),
      organizerId: "user-staff",
    },
  ];

  for (const e of events) {
    await client.event.upsert({
      where: { id: e.id },
      create: {
        ...e,
        createdAt: now,
        updatedAt: now,
      },
      update: {
        title: e.title,
        description: e.description,
        location: e.location,
        category: e.category,
        status: e.status,
        capacity: e.capacity,
        startDatetime: e.startDatetime,
        endDatetime: e.endDatetime,
        organizerId: e.organizerId,
        updatedAt: now,
      },
    });
  }

  const rsvpRows = [
    {
      id: "rsvp-1",
      eventId: "event-1",
      userId: "user-reader",
      status: RSVPStatus.going,
      createdAt: now,
    },
    {
      id: "rsvp-2",
      eventId: "event-2",
      userId: "user-reader",
      status: RSVPStatus.waitlisted,
      createdAt: now,
    },
    {
      id: "rsvp-3",
      eventId: "event-3",
      userId: "user-reader",
      status: RSVPStatus.cancelled,
      createdAt: now,
    },
  ];

  for (const r of rsvpRows) {
    await client.rsvp.upsert({
      where: { id: r.id },
      create: r,
      update: {
        eventId: r.eventId,
        userId: r.userId,
        status: r.status,
      },
    });
  }
}
