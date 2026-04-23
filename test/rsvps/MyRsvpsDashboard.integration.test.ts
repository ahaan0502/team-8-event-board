import request from "supertest";
import { createComposedApp } from "../../src/composition";

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
    const expressApp = createComposedApp().getExpressApp();
    member = request.agent(expressApp);
    staff = request.agent(expressApp);

    await loginAs(member, "user@app.test");
    await loginAs(staff, "staff@app.test");
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