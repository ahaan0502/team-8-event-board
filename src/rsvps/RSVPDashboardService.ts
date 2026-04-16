import { Ok, type Result } from '../lib/result'
import type { Event } from '../events/event'
import type { EventRepository } from '../events/eventRepository'
import type { RSVP, RSVPStatus } from './RSVP'
import type { RSVPRepository } from './RSVPRepository'

export type DashboardItem = {
  rsvp: RSVP
  event: Event
}

export type MyRsvpsDashboard = {
  going: DashboardItem[]
  waitlisted: DashboardItem[]
  cancelled: DashboardItem[]
}

export interface IRSVPDashboardService {
  getMyRsvpsDashboard(
    userId: string
  ): Promise<Result<MyRsvpsDashboard, never>>
}

class RSVPDashboardService implements IRSVPDashboardService {
  constructor(
    private readonly rsvpRepository: RSVPRepository,
    private readonly eventRepository: EventRepository
  ) {}

  async getMyRsvpsDashboard(
    userId: string
  ): Promise<Result<MyRsvpsDashboard, never>> {
    const userRsvps = await this.rsvpRepository.findByUserId(userId)

    const eventIds = userRsvps.map((rsvp) => rsvp.eventId)
    const events = await this.eventRepository.getEventsByIds(eventIds)

    const eventMap = new Map<string, Event>(
      events.map((event) => [event.id, event])
    )

    const dashboard: MyRsvpsDashboard = {
      going: [],
      waitlisted: [],
      cancelled: [],
    }

    for (const rsvp of userRsvps) {
      const event = eventMap.get(rsvp.eventId)
      if (!event) continue

      const item: DashboardItem = {
        rsvp,
        event,
      }

      dashboard[rsvp.status].push(item)
    }

    return Ok(dashboard)
  }
}

export function CreateRSVPDashboardService(
  rsvpRepository: RSVPRepository,
  eventRepository: EventRepository
): IRSVPDashboardService {
  return new RSVPDashboardService(rsvpRepository, eventRepository)
}