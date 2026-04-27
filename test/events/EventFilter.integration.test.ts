import request from "supertest";
import { createComposedApp } from "../../src/composition";

const app = createComposedApp().getExpressApp();
const agent = request.agent(app);

beforeEach(async () => {
  await agent
    .post("/login")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send("email=user@app.test&password=password123")
    .redirects(1);
});

describe("GET /events", () => {
  it("returns the event list page for authenticated users", async () => {
    const res = await agent.get("/events");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Upcoming Events");
  });

  it("redirects unauthenticated users to /login", async () => {
    const anonAgent = request.agent(app);
    const res = await anonAgent.get("/events").redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  it("filters by category and shows matching events", async () => {
    const res = await agent.get("/events?category=Entertainment");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Spring Concert");
  });

  it("filters out events that don't match the category", async () => {
    const res = await agent.get("/events?category=Tech");
    expect(res.status).toBe(200);
    expect(res.text).not.toContain("Spring Concert");
  });

  it("returns 400 for an invalid timeframe value", async () => {
    const res = await agent
      .get("/events?timeframe=invalid")
      .set("HX-Request", "true");
    expect(res.status).toBe(400);
  });

  it("returns empty list message when no events match", async () => {
    const res = await agent.get("/events?category=Nonexistent");
    expect(res.status).toBe(200);
    expect(res.text).toContain("No upcoming events match your search or filters.");
  });

  it("returns partial HTML for HTMX requests", async () => {
    const res = await agent.get("/events").set("HX-Request", "true");
    expect(res.status).toBe(200);
    expect(res.text).toContain("event-list");
    expect(res.text).not.toContain("<html");
  });
});
