import request from "supertest";
import { createComposedApp } from "../../src/composition";
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

function createClient() {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url });

  return new PrismaClient({ adapter });
}

const prisma = createClient();

describe("Feature 7 - My RSVPs Dashboard (integration)", () => {
  let member: ReturnType<typeof request.agent>;
  let staff: ReturnType<typeof request.agent>;

  async function loginAs(
    agent: ReturnType<typeof request.agent>,
    email: string
  ): Promise<void> {
    const res = await agent.post("/login").type("form").send({
      email,
      password: "password123",
    });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/");
  }

  beforeEach(async () => {
  await prisma.rsvp.deleteMany();
  await prisma.event.deleteMany();

  await prisma.event.createMany({
    data: [
      {
        id: "event-1",
        title: "Hack Night",
        description: "Build together and practice coding.",
        location: "CS Building",
        category: "Tech",
        status: "published",
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
        status: "draft",
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
        status: "published",
        capacity: 100,
        startDatetime: new Date("2026-04-25T19:00:00"),
        endDatetime: new Date("2026-04-25T21:00:00"),
        organizerId: "user-staff",
      },
    ],
  });

  await prisma.rsvp.createMany({
    data: [
      {
        id: "rsvp-1",
        eventId: "event-1",
        userId: "user-reader",
        status: "going",
      },
      {
        id: "rsvp-2",
        eventId: "event-2",
        userId: "user-reader",
        status: "waitlisted",
      },
      {
        id: "rsvp-3",
        eventId: "event-3",
        userId: "user-reader",
        status: "cancelled",
      },
    ],
  });

  const expressApp = createComposedApp().getExpressApp();

  staff = request.agent(expressApp);
  member = request.agent(expressApp);

  await loginAs(staff, "staff@app.test");
  await loginAs(member, "user@app.test");
});

  it("allows member access to /my-rsvps", async () => {
    const res = await member.get("/my-rsvps");

    expect(res.status).toBe(200);
    expect(res.text).toContain("My RSVPs");
    expect(res.text).toContain('id="my-rsvps-sections"');
  });

  it("rejects non-member access to /my-rsvps", async () => {
    const res = await staff.get("/my-rsvps");

    expect(res.status).toBe(403);
    expect(res.text).toContain("Only members can access My RSVPs.");
  });

  it("redirects unauthenticated users to /login", async () => {
    const expressApp = createComposedApp().getExpressApp();
    const anon = request.agent(expressApp);

    const res = await anon.get("/my-rsvps");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  it("returns partial sections for HTMX requests", async () => {
    const res = await member.get("/my-rsvps").set("HX-Request", "true");

    expect(res.status).toBe(200);
    expect(res.text).toContain("<h2>Upcoming</h2>");
    expect(res.text).toContain("<h2>Past/Cancelled</h2>");
    expect(res.text).not.toContain("<h1>My RSVPs</h1>");
    expect(res.text).not.toContain('id="my-rsvps-sections"');
  });

  it("renders seeded RSVP events in dashboard sections", async () => {
    const res = await member.get("/my-rsvps");

    expect(res.status).toBe(200);
    expect(res.text).toContain("<h2>Upcoming</h2>");
    expect(res.text).toContain("<h2>Past/Cancelled</h2>");
    expect(res.text).toContain("Hack Night");
    expect(res.text).toContain("Club Social");
    expect(res.text).toContain("Spring Concert");
  });
});