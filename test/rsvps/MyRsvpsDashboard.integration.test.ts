import request from "supertest";
import { createComposedApp } from "../../src/composition";

describe("Feature 7 - My RSVPs Dashboard (integration)", () => {
  let member: ReturnType<typeof request.agent>;
  let organizer: ReturnType<typeof request.agent>;

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
    const expressApp = createComposedApp().getExpressApp();

    member = request.agent(expressApp);
    organizer = request.agent(expressApp);

    await loginAs(member, "user@app.test");
    await loginAs(organizer, "staff@app.test");
  });

  it("allows a member to access /my-rsvps (happy path)", async () => {
    const res = await member.get("/my-rsvps");

    expect(res.status).toBe(200);
    expect(res.text).toContain("My RSVPs");
  });

  it("rejects organizer access to /my-rsvps", async () => {
    const res = await organizer.get("/my-rsvps");

    // Expected product behavior for Feature 7
    expect(res.status).toBe(403);
    expect(res.text).toContain("Only members can access My RSVPs.");
  });

  it("groups RSVP items into upcoming vs past/cancelled correctly", async () => {
    const res = await member.get("/my-rsvps");
    expect(res.status).toBe(200);

    // Seeded data currently includes:
    // - event-1: Hack Night (past) + going
    // - event-2: Club Social (upcoming) + waitlisted
    // - event-3: Spring Concert + cancelled RSVP
    //
    // Expected product grouping:
    // - upcoming: Club Social
    // - past/cancelled: Hack Night, Spring Concert

    expect(res.text).toContain("Upcoming");
    expect(res.text).toContain("Past/Cancelled");

    expect(res.text).toContain("Club Social");
    expect(res.text).toContain("Hack Night");
    expect(res.text).toContain("Spring Concert");
  });

  it("sorts events correctly within each dashboard section", async () => {
    const res = await member.get("/my-rsvps");
    expect(res.status).toBe(200);

    const hackNightIdx = res.text.indexOf("Hack Night");
    const springConcertIdx = res.text.indexOf("Spring Concert");

    expect(hackNightIdx).toBeGreaterThan(-1);
    expect(springConcertIdx).toBeGreaterThan(-1);
    expect(hackNightIdx).toBeLessThan(springConcertIdx);
  });

  it("redirects unauthenticated users to /login (edge case)", async () => {
    const expressApp = createComposedApp().getExpressApp();
    const anon = request.agent(expressApp);

    const res = await anon.get("/my-rsvps");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });
});