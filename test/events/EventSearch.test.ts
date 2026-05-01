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

describe("Event Search (Feature 10)", () => {
  it("returns 200 for GET /events with no search query", async () => {
    const res = await agent.get("/events");
    expect(res.status).toBe(200);
  });

  it("returns matching event when searching by title keyword", async () => {
    const res = await agent.get("/events?q=Hack");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Hack Night");
  });

  it("excludes non-matching events from search results", async () => {
    const res = await agent.get("/events?q=Hack");
    expect(res.status).toBe(200);
    expect(res.text).not.toContain("Spring Concert");
  });

  it("returns matching event when searching by description keyword", async () => {
    const res = await agent.get("/events?q=music");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Spring Concert");
  });

  it("returns no results for an unmatched query", async () => {
    const res = await agent.get("/events?q=zzzzznomatch");
    expect(res.status).toBe(200);
    expect(res.text).toContain("No upcoming events");
  });

  it("search is case-insensitive", async () => {
    const res = await agent.get("/events?q=HACK");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Hack Night");
  });

  it("returns 400 when search query exceeds 200 characters", async () => {
    const longQuery = "a".repeat(201);
    const res = await agent.get(`/events?q=${longQuery}`);
    expect(res.status).toBe(400);
  });
});
