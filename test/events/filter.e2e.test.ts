import request from "supertest";
import { createComposedApp } from "../../src/composition";

function makeApp() {
  return createComposedApp().getExpressApp();
}

describe("Feature 6 - event filters", () => {
  it("returns the events page", async () => {
    const app = makeApp();
    const agent = request.agent(app);

    await agent
      .post("/login")
      .type("form")
      .send({ email: "admin@app.test", password: "password123" });

    const res = await agent.get("/events");

    expect(res.status).toBe(200);
    expect(res.text).toContain("Events");
  });

  it("filters by category", async () => {
    const app = makeApp();
    const agent = request.agent(app);

    await agent
      .post("/login")
      .type("form")
      .send({ email: "admin@app.test", password: "password123" });

    const res = await agent.get("/events?category=Entertainment");

    expect(res.status).toBe(200);
    expect(res.text).toContain("Spring Concert");
  });

  it("rejects invalid timeframe", async () => {
    const app = makeApp();
    const agent = request.agent(app);

    await agent
      .post("/login")
      .type("form")
      .send({ email: "admin@app.test", password: "password123" });

    const res = await agent.get("/events?timeframe=badvalue");

    expect(res.status).toBe(400);
  });
});
