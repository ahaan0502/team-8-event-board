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

describe("GET /events search", () => {
  it("returns events matching title search query", async () => {
    const res = await agent.get("/events?q=hack");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Hack Night");
  });

  it("returns events matching location search query", async () => {
    const res = await agent.get("/events?q=campus");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Spring Concert");
  });

  it("returns events matching description search query", async () => {
    const res = await agent.get("/events?q=live music");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Spring Concert");
  });

  it("excludes events that do not match the search query", async () => {
    const res = await agent.get("/events?q=hack");
    expect(res.status).toBe(200);
    expect(res.text).not.toContain("Spring Concert");
  });

  it("returns empty state when no events match the search query", async () => {
    const res = await agent.get("/events?q=zzznomatch");
    expect(res.status).toBe(200);
    expect(res.text).toContain("No upcoming events match your search or filters.");
  });

  it("returns 400 for a search query over 200 characters", async () => {
    const longQuery = "a".repeat(201);
    const res = await agent
      .get(`/events?q=${longQuery}`)
      .set("HX-Request", "true");
    expect(res.status).toBe(400);
  });

  it("is case insensitive", async () => {
    const res = await agent.get("/events?q=HACK");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Hack Night");
  });
});
