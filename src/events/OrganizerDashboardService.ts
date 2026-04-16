import { Ok, type Result } from "../lib/result";
import type { RSVPRepository } from "../rsvps/RSVPRepository";
import type { Event, EventStatus } from "./event";
import type { EventRepository } from "./eventRepository";

export type OrganizerDashboardItem = {
  event: Event;
  attendeeCount: number;
};

export type OrganizerDashboard = {
  draft: OrganizerDashboardItem[];
  published: OrganizerDashboardItem[];
  cancelled: OrganizerDashboardItem[];
  past: OrganizerDashboardItem[];
};

export interface IOrganizerDashboardService {
  getOrganizerDashboard(
    organizerId: string
  ): Promise<Result<OrganizerDashboard, never>>;
}

class OrganizerDashboardService implements IOrganizerDashboardService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly rsvpRepository: RSVPRepository
  ) {}

  async getOrganizerDashboard(
    organizerId: string
  ): Promise<Result<OrganizerDashboard, never>> {
    const events = await this.eventRepository.getEventsByOrganizerId(organizerId);

    const dashboard: OrganizerDashboard = {
      draft: [],
      published: [],
      cancelled: [],
      past: [],
    };

    for (const event of events) {
      const rsvps = await this.rsvpRepository.findByEventId(event.id);
      const attendeeCount = rsvps.filter((rsvp) => rsvp.status === "going").length;

      const item: OrganizerDashboardItem = {
        event,
        attendeeCount,
      };

      switch (event.status) {
        case "draft":
          dashboard.draft.push(item);
          break;
        case "published":
          dashboard.published.push(item);
          break;
        case "cancelled":
          dashboard.cancelled.push(item);
          break;
        case "past":
          dashboard.past.push(item);
          break;
      }
    }

    const sortByStartDatetime = (
      a: OrganizerDashboardItem,
      b: OrganizerDashboardItem
    ) => a.event.startDatetime.getTime() - b.event.startDatetime.getTime();

    dashboard.draft.sort(sortByStartDatetime);
    dashboard.published.sort(sortByStartDatetime);
    dashboard.cancelled.sort(sortByStartDatetime);
    dashboard.past.sort(sortByStartDatetime);

    return Ok(dashboard);
  }
}

export function CreateOrganizerDashboardService(
  eventRepository: EventRepository,
  rsvpRepository: RSVPRepository
): IOrganizerDashboardService {
  return new OrganizerDashboardService(eventRepository, rsvpRepository);
}