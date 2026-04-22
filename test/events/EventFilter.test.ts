import { CreateEventService } from "../../src/events/eventService";
import type { EventRepository } from "../../src/events/eventRepository";
import type { Event } from "../../src/events/event";

const FUTURE = new Date(Date.now() + 86_400_000);   // +1 day
const FAR    = new Date(Date.now() + 172_800_000);  // +2 days

function makeRepo(events: Event[]): EventRepository {
  const store = new Map(events.map((e) => [e.id, e]));
  return {
    async getAll() { return Array.from(store.values()); },
    async create(e) { store.set(e.id, e); return e; },
    async update(e) { store.set(e.id, e); return e; },
    async getEventById(id) { return store.get(id) ?? null; },
    async getEventsByIds(ids) { return Array.from(store.values()).filter((e) => ids.includes(e.id)); },
    async getEventsByOrganizerId(id) { return Array.from(store.values()).filter((e) => e.organizerId === id); },
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

const techEvent    = makeEvent({ id: "e1", category: "Tech",   title: "TypeScript Talk" });
const musicEvent   = makeEvent({ id: "e2", category: "Music",  title: "Jazz Night" });
const draftEvent   = makeEvent({ id: "e3", status: "draft",    title: "Hidden Draft" });
const pastEvent    = makeEvent({ id: "e4", startDatetime: new Date("2020-01-01"), endDatetime: new Date("2020-01-02"), title: "Old Event" });
const specificDate = makeEvent({ id: "e5", category: "Social", title: "Picnic", startDatetime: new Date("2026-06-15T12:00:00"), endDatetime: new Date("2026-06-15T14:00:00") });

const service = CreateEventService(makeRepo([techEvent, musicEvent, draftEvent, pastEvent, specificDate]));

describe("EventService.listEvents", () => {
  it("returns only published upcoming events when no filters are applied", async () => {
    const result = await service.listEvents({});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ids = result.value.map((e) => e.id);
    expect(ids).toContain("e1");
    expect(ids).toContain("e2");
    expect(ids).toContain("e5");
    expect(ids).not.toContain("e3"); // draft excluded
    expect(ids).not.toContain("e4"); // past excluded
  });

  it("filters by category", async () => {
    const result = await service.listEvents({ category: "Tech" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.every((e) => e.category === "Tech")).toBe(true);
    expect(result.value.map((e) => e.id)).toContain("e1");
    expect(result.value.map((e) => e.id)).not.toContain("e2");
  });

  it("filters by date", async () => {
    const result = await service.listEvents({ date: "2026-06-15" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((e) => e.id)).toEqual(["e5"]);
  });

  it("filters by search query matching title", async () => {
    const result = await service.listEvents({ q: "jazz" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((e) => e.id)).toEqual(["e2"]);
  });

  it("filters by search query matching description", async () => {
    const result = await service.listEvents({ q: "A test event" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.length).toBeGreaterThan(0);
  });

  it("combines category and date filters", async () => {
    const result = await service.listEvents({ category: "Social", date: "2026-06-15" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.map((e) => e.id)).toEqual(["e5"]);
  });

  it("returns empty list when no events match filters", async () => {
    const result = await service.listEvents({ category: "Career" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(0);
  });

  it("returns sorted results by start time ascending", async () => {
    const result = await service.listEvents({});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const times = result.value.map((e) => e.startDatetime.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("returns an InvalidFilterError for an invalid date string", async () => {
    const result = await service.listEvents({ date: "not-a-date" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.value.type).toBe("InvalidFilterError");
  });
});
