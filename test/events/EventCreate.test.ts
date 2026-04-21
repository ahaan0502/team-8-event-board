import request from "supertest";
import { createComposedApp } from "../../src/composition";

const app = createComposedApp().getExpressApp();
const agent = request.agent(app);

    beforeEach(async () => {
  const res = await agent
    .post("/login")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send("email=user@app.test&password=password123")
    .redirects(1);

  console.log("LOGIN STATUS:", res.status);
});
    

describe("eventService", () => {
    
    it("creates event with valid input", async () => {
  const res = await agent
    .post("/events")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send(
      new URLSearchParams({
        title: "Test Event",
        description: "Test Description",
        location: "Test Location",
        category: "Test Category",
        startTime: new Date(Date.now() + 10000).toISOString(),
        endTime: new Date(Date.now() + 20000).toISOString(),
        capacity: "10"
      }).toString()
    );

  expect(res.status).toBe(302);
});

it("returns 400 when title is missing", async () => {
  const res = await agent
    .post("/events")
    .send(
      new URLSearchParams({
        title: "",
        description: "Test Description",
        location: "Test Location",
        category: "Test Category",
        startTime: new Date(Date.now() + 10000).toISOString(),
        endTime: new Date(Date.now() + 20000).toISOString(),
        capacity: "10"
      }).toString()
    );

  expect(res.status).toBe(400);
});

it("returns 400 when endTime is before startTime", async () => {
  const res = await agent
    .post("/events")
    .send(
      new URLSearchParams({
        title: "Test Event",
        description: "Test Description",
        location: "Test Location",
        category: "Test Category",
        startTime: new Date(Date.now() + 10000).toISOString(),
        endTime: new Date(Date.now() + 5000).toISOString(),
        capacity: "10"
      }).toString()
    );

  expect(res.status).toBe(400);
});

})