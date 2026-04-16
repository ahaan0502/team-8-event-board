import type { Request, Response } from "express";
import type { IEventService } from "./eventService";
import { touchAppSession } from "../session/AppSession";

export interface IEventController {
  listEvents(req: Request, res: Response): Promise<void>;
}

class EventController implements IEventController {
  constructor(private readonly service: IEventService) {}

  async listEvents(req: Request, res: Response): Promise<void> {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const category =
      typeof req.query.category === "string" ? req.query.category : undefined;
    const date =
      typeof req.query.date === "string" ? req.query.date : undefined;

    const session = touchAppSession(req.session as any);

    const result = await this.service.listEvents({
      q,
      category,
      date,
    });

    if (result.ok === false) {
      res.status(400).render("events/index", {
        events: [],
        filters: { q, category, date },
        pageError: result.value.message,
        session,
      });
      return;
    }

    res.render("events/index", {
      events: result.value,
      filters: { q, category, date },
      pageError: null,
      session,
    });
  }
}

export function createEventController(
  service: IEventService
): IEventController {
  return new EventController(service);
}