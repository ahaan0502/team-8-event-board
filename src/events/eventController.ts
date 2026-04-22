import type { Request, Response } from "express";
import type { IEventService, CreateEventInput } from "./eventService";
import {
  touchAppSession,
  getAuthenticatedUser,
  type AppSessionStore,
  type IAppBrowserSession,
} from "../session/AppSession";
import type { ILoggingService } from "../service/LoggingService";
import type { EventError } from "./errors";
import { IRSVPService } from "./rsvpService";

export interface IEventController {
  listEvents(req: Request, res: Response): Promise<void>;
  showCreateEvent(res: Response, session: IAppBrowserSession, pageError?: string | null): Promise<void>;
  createEventFromForm(res: Response, input: Omit<CreateEventInput, "organizerId">, store: AppSessionStore): Promise<void>;
  getEventDetail(res: Response, eventId: string, store: AppSessionStore): Promise<void>;
  showEditEvent(res: Response, eventId: string, store: AppSessionStore, pageError?: string | null): Promise<void>;
  updateEventFromForm(res: Response, eventId: string, input: Omit<CreateEventInput, "organizerId">, store: AppSessionStore): Promise<void>;
  toggleRSVP(res: Response, eventId: string, store: AppSessionStore): Promise<void>;
  publishEventFromForm(res: Response, eventId: string, store: AppSessionStore, htmx?: boolean): Promise<void>;
  cancelEventFromForm(res: Response, eventId: string, store: AppSessionStore, htmx?: boolean): Promise<void>;
}

class EventController implements IEventController {
  constructor(
    private readonly service: IEventService,
    private readonly rsvpService: IRSVPService,
    private readonly logger: ILoggingService
  ) {}

  private mapErrorStatus(error: EventError): number {
    switch (error.type) {
      case "ValidationError":
      case "InvalidTimeRangeError":
      case "InvalidCapacityError":
      case "InvalidStateError":
        return 400;

      case "NotFoundError":
        return 404;

      case "NotAuthorizedError":
        return 403;

      case "UnauthorizedError":
        return 401;

      default:
        return 500;
    }
  }
  async listEvents(req: Request, res: Response): Promise<void> {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const date = typeof req.query.date === "string" ? req.query.date : undefined;

    const session = touchAppSession(req.session as any);

    const result = await this.service.listEvents({ q, category, date });

    const isHtmx = req.get("HX-Request") === "true";
    const view = isHtmx ? "events/partials/eventList" : "events/index";
    const layoutOpts = isHtmx ? { layout: false } : {};

    if (result.ok === false) {
      res.status(400).render(view, {
        events: [],
        filters: { q, category, date },
        pageError: result.value.message,
        session,
        ...layoutOpts,
      });
      return;
    }

    res.render(view, {
      events: result.value,
      filters: { q, category, date },
      pageError: null,
      session,
      ...layoutOpts,
    });
  }

  async showCreateEvent(
    res: Response,
    session: IAppBrowserSession,
    pageError: string | null = null
  ): Promise<void> {
    res.render("events/create", { session, pageError });
  }

  async createEventFromForm(
    res: Response,
    input: Omit<CreateEventInput, "organizerId">,
    store: AppSessionStore
  ): Promise<void> {
    const session = touchAppSession(store);
    const user = getAuthenticatedUser(store);

    if (!user) {
      res.status(403).render("partials/error", { message: "You must be logged in.", layout: false });
      return;
    }

    const result = await this.service.createEvent({ ...input, organizerId: user.userId });

    if (result.ok === false) {
      res.status(400);
      await this.showCreateEvent(res, session, result.value.message);
      return;
    }

    res.redirect(`/events/${result.value.id}`);
  }

  async getEventDetail(
    res: Response,
    eventId: string,
    store: AppSessionStore
  ): Promise<void> {
    const session = touchAppSession(store);
    const user = getAuthenticatedUser(store);
    const result = await this.service.getEventById(eventId, user?.userId);

    if (result.ok === false) {
      res.status(404).send("Event not found");
      return;
    }

    res.render("events/detail", {
      event: result.value,
      session,
      pageError: null,
    });
  }

  async showEditEvent(
    res: Response,
    eventId: string,
    store: AppSessionStore,
    pageError: string | null = null
  ): Promise<void> {
    const session = touchAppSession(store);
    const user = getAuthenticatedUser(store);

    const result = await this.service.getEventById(eventId, user?.userId);

    if (result.ok === false) {
      res.status(404).send("Event not found");
      return;
    }

    res.render("events/edit", {
      event: result.value,
      session,
      pageError,
    });
  }

  async updateEventFromForm(
    res: Response,
    eventId: string,
    input: Omit<CreateEventInput, "organizerId">,
    store: AppSessionStore
  ): Promise<void> {
    const user = getAuthenticatedUser(store);

    if (!user) {
      this.logger.warn("Unauthorized event update attempt");
      res.status(401);
      await this.showEditEvent(res, eventId, store, "You must be logged in.");
      return;
    }

    const result = await this.service.updateEvent(eventId, input, user.userId);

    if (result.ok === false) {
      const error = result.value;
      const status = this.mapErrorStatus(error);
      const log = status >= 500 ? this.logger.error : this.logger.warn;
      log.call(this.logger, `Event update failed: ${error.message}`);
      res.status(status);
      const isHx = res.req?.get("HX-Request");

      if (isHx) {
        const session = touchAppSession(store);

        res.render("events/edit", {
          event: {
            id: eventId,
            ...input,
          },
          session,
          pageError: error.message,
          layout: false,
        });
        return;
      }

      await this.showEditEvent(res, eventId, store, error.message);
      return;
    }

    this.logger.info(`Updated event ${eventId}`);
    const isHx = res.req?.get("HX-Request");

    if (isHx) {
      const session = touchAppSession(store);

        res.render("events/edit", {
          event: result.value,
          session,
          pageError: null,
          layout: false,
        });
      return;
    }

    res.redirect(`/events/${eventId}`);
  }

  async toggleRSVP(
    res: Response,
    eventId: string,
    store: AppSessionStore
  ): Promise<void> {
    const user = getAuthenticatedUser(store);
    if (!user) {
      res.status(401).send("Must be logged in");
      return;
    }

    const result = await this.rsvpService.toggleRSVP(eventId, user.userId);

    if (result.ok === false) {
      const status = this.mapErrorStatus(result.value);
      res.status(status).send(result.value.message);
      return;
    }

    const eventResult = await this.service.getEventById(eventId, user.userId);

    if (eventResult.ok === false) {
      res.status(500).send("Failed to reload event");
      return;
    }

    res.render("events/partials/rsvpSection", {
      event: eventResult.value,
      layout: false,
    });
  }

  async publishEventFromForm(
    res: Response,
    eventId: string,
    store: AppSessionStore,
    htmx = false
  ): Promise<void> {
    const user = getAuthenticatedUser(store);
    if (!user) {
      res.status(403).render("partials/error", { message: "You must be logged in.", layout: false });
      return;
    }

    const result = await this.service.publishEvent(eventId, user.userId, user.role);

    if (result.ok === false) {
      const status = result.value.type === "NotFoundError" ? 404
        : result.value.type === "NotAuthorizedError" ? 403 : 400;
      this.logger.warn(`Publish failed for ${eventId}: ${result.value.message}`);
      res.status(status).render("partials/error", { message: result.value.message, layout: false });
      return;
    }

    this.logger.info(`Published event ${eventId}`);
    if (htmx) {
      const session = touchAppSession(store);
      res.render("events/partials/organizer-controls", { event: result.value, session, layout: false });
      return;
    }
    res.redirect(`/events/${eventId}`);
  }

  async cancelEventFromForm(
    res: Response,
    eventId: string,
    store: AppSessionStore,
    htmx = false
  ): Promise<void> {
    const user = getAuthenticatedUser(store);
    if (!user) {
      res.status(403).render("partials/error", { message: "You must be logged in.", layout: false });
      return;
    }

    const result = await this.service.cancelEvent(eventId, user.userId, user.role);

    if (result.ok === false) {
      const status = result.value.type === "NotFoundError" ? 404
        : result.value.type === "NotAuthorizedError" ? 403 : 400;
      this.logger.warn(`Cancel failed for ${eventId}: ${result.value.message}`);
      res.status(status).render("partials/error", { message: result.value.message, layout: false });
      return;
    }

    this.logger.info(`Cancelled event ${eventId}`);
    if (htmx) {
      const session = touchAppSession(store);
      res.render("events/partials/organizer-controls", { event: result.value, session, layout: false });
      return;
    }
    res.redirect(`/events/${eventId}`);
  }
}

export function CreateEventController(
  service: IEventService,
  rsvpService: IRSVPService,
  logger: ILoggingService
): IEventController {
  return new EventController(service, rsvpService, logger);
}
