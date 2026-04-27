import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.event.upsert({
    where: { id: "event-1" },
    update: {},
    create: {
      id: "event-1",
      title: "Hack Night",
      description: "Build together and practice coding.",
      location: "CS Building",
      category: "Tech",
      status: "published",
      capacity: 20,
      startDatetime: new Date("2027-04-20T18:00:00"),
      endDatetime: new Date("2027-04-20T20:00:00"),
      organizerId: "user-staff",
    },
  });

  await prisma.event.upsert({
    where: { id: "event-2" },
    update: {},
    create: {
      id: "event-2",
      title: "Club Social",
      description: "Casual meetup for members.",
      location: "Student Union",
      category: "Social",
      status: "draft",
      capacity: 40,
      startDatetime: new Date("2027-04-22T17:00:00"),
      endDatetime: new Date("2027-04-22T19:00:00"),
      organizerId: "user-staff",
    },
  });

  await prisma.event.upsert({
    where: { id: "event-3" },
    update: {},
    create: {
      id: "event-3",
      title: "Spring Concert",
      description: "Live music event.",
      location: "Campus Center",
      category: "Entertainment",
      status: "published",
      capacity: 100,
      startDatetime: new Date("2027-04-25T19:00:00"),
      endDatetime: new Date("2027-04-25T21:00:00"),
      organizerId: "user-staff",
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
