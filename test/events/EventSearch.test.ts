import { CreateEventService } from "../../src/events/eventService";
import type { EventRepository } from "../../src/events/eventRepository";
import type { Event } from "../../src/events/event";

const FUTURE = new Date(Date.now() + 86_400_000);
const FAR = new Date(Date.now() + 172_800_000);

function makeRepo(events: Event[]): EventRepository {
  const store = new Map(events.map((e) => [e.id, e]));
  return {
    async getAll() { return Array.from(store.values()); },
    async create(e) { store.set(e.id, e); return e; },
    async update(e) { store.set(e.id, e); return e; },
    async getEventById(id) { return store.get(id) ?? null; },
    async getEventsByIds(ids) {
      return Array.from(store.values()).filter((e) => ids.includes(e.id));
    },
    async getEventsByOrganizerId(id) {
      return Array.from(store.values()).filter((e) => e.organizerId === id);
    },
  };
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: Math.random().toString(36).slice(2),
    title: "Test Event",
    description: "A test event",
    location: "Room 101",
    category: "Tech",
    status: "published",
    capacity: 50,
    startDatetime: FUTURE,
    endDatetime: FAR,
    organizerId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const tsEvent = makeEvent({ id: "e1", title: "TypeScript Talk", description: "Advanced TS patterns", location: "CS Building" });
const jazzEvent = makeEvent({ id: "e2", title: "Jazz Night", description: "Live jazz music", location: "Blue Room" });
const campusEvent = makeEvent({ id: "e3", title: "Campus Meetup", description: "Networking event", location: "Main Campus Hall" });
const draftEvent = makeEvent({ id: "e4", status: "draft", title: "Hidden Draft", description: "Should not appear" });

const service = CreateEventService(makeRepo([tsEvent, jazzEvent, campusEvent, draftEvent]));

describe("Feature 10 — Event Search", () => {
  it("returns all published upcoming events when query is empty", async () => {
    const result = await service.listPublishedEvents({ q: "" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ids = result.value.map((e) => e.id);
    expect(ids).toContain("e1");
    expect(ids).toContain("e2");
    expect(ids).toContain("e3");
    expect(ids).not.toContain("e4");
  });

  it("returns all published upcoming events when no query is provided", async () => {
    const result = await service.listPublishedEvents({});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.length).toBe(3);
  });

  it("matches by title (case-insensitive)", async () => {
    const result = await service.listPublishedEvents({ q: "typescript" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((e) => e.id)).toContain("e1");
    expect(result.value.map((e) => e.id)).not.toContain("e2");
  });

  it("matches by description", async () => {
    const result = await service.listPublishedEvents({ q: "live jazz" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((e) => e.id)).toContain("e2");
  });

  it("matches by location", async () => {
    const result = await service.listPublishedEvents({ q: "campus" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((e) => e.id)).toContain("e3");
  });

  it("returns empty list when no events match the query", async () => {
    const result = await service.listPublishedEvents({ q: "xyznonexistent" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(0);
  });

  it("does not return draft events even if they match the query", async () => {
    const result = await service.listPublishedEvents({ q: "hidden draft" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((e) => e.id)).not.toContain("e4");
  });

  it("returns InvalidSearchError for a query over 200 characters", async () => {
    const result = await service.listPublishedEvents({ q: "a".repeat(201) });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.value.type).toBe("InvalidSearchError");
  });

  it("accepts a query of exactly 200 characters", async () => {
    const result = await service.listPublishedEvents({ q: "a".repeat(200) });
    expect(result.ok).toBe(true);
  });
});
