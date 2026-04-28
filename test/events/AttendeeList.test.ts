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

describe("attendee list", () => {
  it("returns 200 for the organizer viewing their event attendees", async () => {
    const eventId = await createEvent();
    const res = await agent.get(`/events/${eventId}/attendees`);
    expect(res.status).toBe(200);
  });

  it("returns 404 for a non-existent event", async () => {
    const res = await agent.get("/events/non-existent-id/attendees");
    expect(res.status).toBe(404);
  });

  it("redirects to login when not logged in", async () => {
    const eventId = await createEvent();
    const unauthAgent = request.agent(app);
    const res = await unauthAgent.get(`/events/${eventId}/attendees`);
    expect(res.status).toBe(302);
    expect(res.headers["location"]).toBe("/login");
  });
});
