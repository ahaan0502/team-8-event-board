import request from "supertest";
import { createComposedApp } from "../../src/composition";

describe("RSVP endpoint", () => {
  let app: ReturnType<ReturnType<typeof createComposedApp>["getExpressApp"]>;
  let authCookie: string[];

  beforeEach(async () => {
    app = createComposedApp().getExpressApp();

    const loginRes = await request(app)
      .post("/login")
      .type("form")
      .send({
        email: "admin@app.test",
        password: "password123",
      });

    const cookies = loginRes.headers["set-cookie"];
    if (!cookies) throw new Error("No auth cookie returned");

    authCookie = Array.isArray(cookies) ? cookies : [cookies];
  });

  async function createEvent() {
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const end = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const createRes = await request(app)
      .post("/events")
      .set("Cookie", authCookie)
      .type("form")
      .send({
        title: "Sprint 2 Test Event",
        description: "Used for RSVP endpoint tests",
        location: "ILC",
        category: "Workshop",
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        capacity: "5",
      });

    const location = createRes.headers.location as string;
    const eventId = location.split("/").pop();

    return { createRes, eventId };
  }

  it("sets up the app and can create a test event", async () => {
    const { createRes, eventId } = await createEvent();

    expect(createRes.status).toBe(302);
    expect(eventId).toBeTruthy();
  });

  it("returns 200 and an HTML fragment for a valid RSVP toggle", async () => {
    const { eventId } = await createEvent();

    const res = await request(app)
      .post(`/events/${eventId}/rsvp`)
      .set("Cookie", authCookie)
      .set("HX-Request", "true");

    expect(res.status).toBe(200);
    expect(res.text).toContain('id="rsvp-section"');
    expect(res.text).toContain("Toggle RSVP");
    expect(res.text).toContain("Your RSVP:");
  });

  it("returns 401 for an unauthenticated RSVP request", async () => {
    const { eventId } = await createEvent();

    const res = await request(app)
      .post(`/events/${eventId}/rsvp`)
      .set("HX-Request", "true");

    expect(res.status).toBe(401);
    expect(res.text).toContain("Please log in to continue.");
  });

  it("returns 400 when the event does not exist", async () => {
    const res = await request(app)
      .post("/events/not-a-real-event-id/rsvp")
      .set("Cookie", authCookie)
      .set("HX-Request", "true");

    expect(res.status).toBe(400);
    expect(res.text).toContain("Event not found");
  });
  
  it("allows toggling RSVP twice for the same event", async () => {
    const { eventId } = await createEvent();

    const firstRes = await request(app)
      .post(`/events/${eventId}/rsvp`)
      .set("Cookie", authCookie)
      .set("HX-Request", "true");

    const secondRes = await request(app)
      .post(`/events/${eventId}/rsvp`)
      .set("Cookie", authCookie)
      .set("HX-Request", "true");

    expect(firstRes.status).toBe(200);
    expect(secondRes.status).toBe(200);
    expect(secondRes.text).toContain('id="rsvp-section"');
  });
});