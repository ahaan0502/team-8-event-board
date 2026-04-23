import request from "supertest";
import { createComposedApp } from "../../src/composition";

const app = createComposedApp().getExpressApp();
const agent = request.agent(app);

const eventData = new URLSearchParams({
  title: "Test Event",
  description: "Test Description",
  location: "Test Location",
  category: "Test Category",
  startTime: new Date(Date.now() + 10000).toISOString(),
  endTime: new Date(Date.now() + 20000).toISOString(),
  capacity: "10",
}).toString();

async function createEvent(): Promise<string> {
  const res = await agent
    .post("/events")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send(eventData);
  const location = res.headers["location"] as string;
  return location.split("/events/")[1];
}

beforeEach(async () => {
  await agent
    .post("/login")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send("email=user@app.test&password=password123");
});

describe("publish event", () => {
  it("publishes a draft event and redirects", async () => {
    const eventId = await createEvent();
    const res = await agent.post(`/events/${eventId}/publish`);
    expect(res.status).toBe(302);
  });

  it("returns 400 when publishing an already published event", async () => {
    const eventId = await createEvent();
    await agent.post(`/events/${eventId}/publish`);
    const res = await agent.post(`/events/${eventId}/publish`);
    expect(res.status).toBe(400);
  });

  it("returns 404 when publishing a non-existent event", async () => {
    const res = await agent.post("/events/non-existent-id/publish");
    expect(res.status).toBe(404);
  });
});

describe("cancel event", () => {
  it("cancels a published event and redirects", async () => {
    const eventId = await createEvent();
    await agent.post(`/events/${eventId}/publish`);
    const res = await agent.post(`/events/${eventId}/cancel`);
    expect(res.status).toBe(302);
  });

  it("returns 400 when cancelling a draft event", async () => {
    const eventId = await createEvent();
    const res = await agent.post(`/events/${eventId}/cancel`);
    expect(res.status).toBe(400);
  });

  it("returns 404 when cancelling a non-existent event", async () => {
    const res = await agent.post("/events/non-existent-id/cancel");
    expect(res.status).toBe(404);
  });
});
