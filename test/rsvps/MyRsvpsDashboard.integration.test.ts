import request from "supertest";
import { createComposedApp } from "../../src/composition";

describe("Feature 8 - Organizer Dashboard (integration)", () => {
  let staff: ReturnType<typeof request.agent>;
  let member: ReturnType<typeof request.agent>;

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

    staff = request.agent(expressApp);
    member = request.agent(expressApp);

    await loginAs(staff, "staff@app.test");
    await loginAs(member, "user@app.test"); 
  });

  it("allows organizer (staff) to access /organizer/events (happy path)", async () => {
    const res = await staff.get("/organizer/events");

    expect(res.status).toBe(200);
    expect(res.text).toContain("Organizer Dashboard");
  });

  it("rejects non-organizer member access to /organizer/events", async () => {
    const res = await member.get("/organizer/events");


    expect(res.status).toBe(403);
    expect(res.text).toContain(
      "Only staff and admins can access the organizer dashboard."
    );
  });

  it("groups events into draft, published, cancelled, and past sections correctly", async () => {
    const res = await staff.get("/organizer/events");
    expect(res.status).toBe(200);


    expect(res.text).toContain("<h2>Draft</h2>");
    expect(res.text).toContain("<h2>Published</h2>");
    expect(res.text).toContain("<h2>Cancelled</h2>");
    expect(res.text).toContain("<h2>Past</h2>");

    const draftStart = res.text.indexOf("<h2>Draft</h2>");
    const publishedStart = res.text.indexOf("<h2>Published</h2>");
    const cancelledStart = res.text.indexOf("<h2>Cancelled</h2>");
    const pastStart = res.text.indexOf("<h2>Past</h2>");

    expect(draftStart).toBeLessThan(publishedStart);
    expect(publishedStart).toBeLessThan(cancelledStart);
    expect(cancelledStart).toBeLessThan(pastStart);

    const draftSlice = res.text.slice(draftStart, publishedStart);
    expect(draftSlice).toContain("Club Social");

    const publishedSlice = res.text.slice(publishedStart, cancelledStart);
    expect(publishedSlice).toContain("Hack Night");
    expect(publishedSlice).toContain("Spring Concert");

    expect(res.text.slice(cancelledStart, pastStart)).toContain("No cancelled events.");
    expect(res.text.slice(pastStart)).toContain("No past events.");
  });

  it("sorts events by start time within the Published section (ascending)", async () => {
    const res = await staff.get("/organizer/events");
    expect(res.status).toBe(200);

    const publishedStart = res.text.indexOf("<h2>Published</h2>");
    const cancelledStart = res.text.indexOf("<h2>Cancelled</h2>");
    const publishedSlice = res.text.slice(publishedStart, cancelledStart);

    const hackIdx = publishedSlice.indexOf("Hack Night");
    const springIdx = publishedSlice.indexOf("Spring Concert");

    expect(hackIdx).toBeGreaterThan(-1);
    expect(springIdx).toBeGreaterThan(-1);
    expect(hackIdx).toBeLessThan(springIdx);
  });

  it("shows correct going attendee counts from seeded RSVPs", async () => {
    const res = await staff.get("/organizer/events");
    expect(res.status).toBe(200);


    expect(res.text).toContain("Hack Night</strong> - Attendees: 1");
    expect(res.text).toContain("Club Social</strong> - Attendees: 0");
    expect(res.text).toContain("Spring Concert</strong> - Attendees: 0");
  });

  it("redirects unauthenticated users to /login (edge case)", async () => {
    const expressApp = createComposedApp().getExpressApp();
    const anon = request.agent(expressApp);

    const res = await anon.get("/organizer/events");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });
});