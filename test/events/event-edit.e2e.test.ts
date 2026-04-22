import request from "supertest";
import { createComposedApp } from "../../src/composition";

describe("Event Edit Endpoint", () => {
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

    const res = await request(app)
      .post("/events")
      .set("Cookie", authCookie)
      .type("form")
      .send({
        title: "Edit Test Event",
        description: "Testing edit feature",
        location: "ILC",
        category: "Workshop",
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        capacity: "5",
      });

    const location = res.headers.location as string;
    const eventId = location.split("/").pop();

    return eventId;
  }
});