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

describe("Event Filter (Feature 6)", () => {
  it("returns 200 for GET /events with no filters", async () => {
    const res = await agent.get("/events");
    expect(res.status).toBe(200);
  });

  it("filters by category and shows matching published event", async () => {
    const res = await agent.get("/events?category=Tech");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Hack Night");
  });

  it("filters by category and excludes events from other categories", async () => {
    const res = await agent.get("/events?category=Tech");
    expect(res.status).toBe(200);
    expect(res.text).not.toContain("Spring Concert");
  });

  it("returns no results for a category with no published events", async () => {
    // Club Social is in Social category but is a draft, not published
    const res = await agent.get("/events?category=Social");
    expect(res.status).toBe(200);
    expect(res.text).toContain("No upcoming events");
  });

  it("filters by Entertainment category", async () => {
    const res = await agent.get("/events?category=Entertainment");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Spring Concert");
  });

  it("returns 400 for an invalid timeframe value", async () => {
    const res = await agent.get("/events?timeframe=invalid");
    expect(res.status).toBe(400);
  });

  it("returns 200 for timeframe=all", async () => {
    const res = await agent.get("/events?timeframe=all");
    expect(res.status).toBe(200);
  });

  it("returns 200 for timeframe=week", async () => {
    const res = await agent.get("/events?timeframe=week");
    expect(res.status).toBe(200);
  });

  it("returns 200 for timeframe=weekend", async () => {
    const res = await agent.get("/events?timeframe=weekend");
    expect(res.status).toBe(200);
  });

  it("combines category and search query filters", async () => {
    const res = await agent.get("/events?category=Tech&q=Hack");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Hack Night");
  });

  it("returns no results when category and search query do not overlap", async () => {
    const res = await agent.get("/events?category=Tech&q=Concert");
    expect(res.status).toBe(200);
    expect(res.text).toContain("No upcoming events");
  });
});
