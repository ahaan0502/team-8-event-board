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

  await prisma.event.upsert({
    where: { id: "test-event-1" },
    update: { startDatetime: daysFromNow(7), endDatetime: daysFromNow(8), status: "published" },
    create: {
      id: "test-event-1",
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
  });

  await prisma.event.upsert({
    where: { id: "test-event-3" },
    update: { startDatetime: daysFromNow(14), endDatetime: daysFromNow(15), status: "published" },
    create: {
      id: "test-event-3",
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
  });

  await prisma.$disconnect();
  sqlite.close();
};
