require("dotenv").config();
const Database = require("better-sqlite3");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

module.exports = async function globalSetup() {
  const dbUrl = process.env.DATABASE_URL?.replace("file:", "") ?? "./prisma/dev.db";
  const sqlite = new Database(path.resolve(dbUrl));
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
  const prisma = new PrismaClient({ adapter });

  const seededEvents = [
    {
      id: "event-1",
      title: "Hack Night",
      description: "Build together and practice coding.",
      location: "CS Building",
      category: "Tech",
      status: "published",
      capacity: 20,
      startDatetime: daysFromNow(7),
      endDatetime: daysFromNow(8),
      organizerId: "user-staff",
    },
    {
      id: "event-2",
      title: "Club Social",
      description: "Casual meetup for members.",
      location: "Student Union",
      category: "Social",
      status: "draft",
      capacity: 40,
      startDatetime: daysFromNow(10),
      endDatetime: daysFromNow(11),
      organizerId: "user-staff",
    },
    {
      id: "event-3",
      title: "Spring Concert",
      description: "Live music event.",
      location: "Campus Center",
      category: "Entertainment",
      status: "published",
      capacity: 100,
      startDatetime: daysFromNow(14),
      endDatetime: daysFromNow(15),
      organizerId: "user-staff",
    },
  ];

  for (const event of seededEvents) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {
        title: event.title,
        description: event.description,
        location: event.location,
        category: event.category,
        status: event.status,
        capacity: event.capacity,
        startDatetime: event.startDatetime,
        endDatetime: event.endDatetime,
        organizerId: event.organizerId,
      },
      create: event,
    });
  }

  const seededRsvps = [
    {
      id: "rsvp-1",
      eventId: "event-1",
      userId: "user-reader",
      status: "going",
      createdAt: new Date(),
    },
    {
      id: "rsvp-2",
      eventId: "event-2",
      userId: "user-reader",
      status: "waitlisted",
      createdAt: new Date(),
    },
    {
      id: "rsvp-3",
      eventId: "event-3",
      userId: "user-reader",
      status: "cancelled",
      createdAt: new Date(),
    },
  ];

  for (const rsvp of seededRsvps) {
    await prisma.rsvp.upsert({
      where: { id: rsvp.id },
      update: {
        status: rsvp.status,
      },
      create: rsvp,
    });
  }

  await prisma.$disconnect();
  sqlite.close();
};
