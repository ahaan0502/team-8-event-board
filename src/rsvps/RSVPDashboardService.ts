import { Ok, type Result } from "../lib/result";
import type { Event } from "../events/event";
import type { EventRepository } from "../events/eventRepository";
import type { RSVP } from "./RSVP";
import type { RSVPRepository } from "../events/rsvpRepository";

export type DashboardItem = {
  rsvp: RSVP;
  event: Event;
};

export type MyRsvpsDashboard = {
  upcoming: DashboardItem[];
  pastCancelled: DashboardItem[];
};

export interface IRSVPDashboardService {
  getMyRsvpsDashboard(userId: string): Promise<Result<MyRsvpsDashboard, never>>;
}

class RSVPDashboardService implements IRSVPDashboardService {
  constructor(
    private readonly rsvpRepository: RSVPRepository,
    private readonly eventRepository: EventRepository
  ) {}

  async getMyRsvpsDashboard(
    userId: string
  ): Promise<Result<MyRsvpsDashboard, never>> {
    const dashboard: MyRsvpsDashboard = {
      upcoming: [],
      pastCancelled: [],
    };

    const now = Date.now();

    let items: DashboardItem[];

    if (this.rsvpRepository.findDashboardRowsByUserId) {
      const rows = await this.rsvpRepository.findDashboardRowsByUserId(userId);
      items = rows.map((row) => ({ rsvp: row.rsvp, event: row.event }));
    } else {
      const userRsvps = await this.rsvpRepository.findByUserId(userId);
      const eventIds = userRsvps.map((rsvp) => rsvp.eventId);
      const events = await this.eventRepository.getEventsByIds(eventIds);
      const eventMap = new Map<string, Event>(events.map((event) => [event.id, event]));
      items = [];
      for (const rsvp of userRsvps) {
        const event = eventMap.get(rsvp.eventId);
        if (!event) continue;
        items.push({ rsvp, event });
      }
    }

    for (const item of items) {
      const { rsvp, event } = item;

      const isPastEvent = event.status === "past" || event.startDatetime.getTime() < now;
      const isCancelledRsvp = rsvp.status === "cancelled";

      if (isPastEvent || isCancelledRsvp) {
        dashboard.pastCancelled.push(item);
      } else {
        dashboard.upcoming.push(item);
      }
    }

    const byStartAsc = (a: DashboardItem, b: DashboardItem) =>
      a.event.startDatetime.getTime() - b.event.startDatetime.getTime();

    dashboard.upcoming.sort(byStartAsc);
    dashboard.pastCancelled.sort(byStartAsc);

    return Ok(dashboard);
  }
}

export function CreateRSVPDashboardService(
  rsvpRepository: RSVPRepository,
  eventRepository: EventRepository
): IRSVPDashboardService {
  return new RSVPDashboardService(rsvpRepository, eventRepository);
}