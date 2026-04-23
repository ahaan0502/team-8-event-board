import request from "supertest";
import { createComposedApp } from "../../src/composition";

const app = createComposedApp().getExpressApp();

const staffAgent = request.agent(app);
const adminAgent = request.agent(app);
const userAgent = request.agent(app);

beforeAll(async () => {
  await staffAgent
    .post("/login")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send("email=staff@app.test&password=password123");

  await adminAgent
    .post("/login")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send("email=admin@app.test&password=password123");

  await userAgent
    .post("/login")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send("email=user@app.test&password=password123");
});

async function createDraftEvent(): Promise<string> {
  const res = await staffAgent
    .post("/events")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send(
      new URLSearchParams({
        title: "Draft Event",
        description: "A draft event",
        location: "Somewhere",
        category: "General",
        startTime: new Date(Date.now() + 10000).toISOString(),
        endTime: new Date(Date.now() + 20000).toISOString(),
        capacity: "10",
      }).toString()
    );

  // Extract the event ID from the redirect Location header
  const location = res.headers["location"] as string;
  const id = location.split("/events/")[1];
  return id;
}

describe("GET /events/:id — event detail", () => {
  it("returns 200 for a published event visible to any authenticated user", async () => {
    const id = await createDraftEvent();

    await adminAgent.post(`/events/${id}/publish`);

    const res = await userAgent.get(`/events/${id}`);
    expect(res.status).toBe(200);
  });

  it("returns 404 for a non-existent event", async () => {
    const res = await userAgent.get("/events/non-existent-id");
    expect(res.status).toBe(404);
  });

  it("returns 200 for a draft event viewed by its organizer", async () => {
    const id = await createDraftEvent();

    const res = await staffAgent.get(`/events/${id}`);
    expect(res.status).toBe(200);
  });

  it.todo("returns 200 for a draft event viewed by an admin");

  it("returns 404 for a draft event viewed by a regular user", async () => {
    const id = await createDraftEvent();

    const res = await userAgent.get(`/events/${id}`);
    expect(res.status).toBe(404);
  });
});