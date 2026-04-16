import type { Response } from "express";
import type { IEventService, CreateEventInput } from "./eventService";
import {
  touchAppSession,
  getAuthenticatedUser,
  type AppSessionStore,
  type IAppBrowserSession,
} from "../session/AppSession";
import type { ILoggingService } from "../service/LoggingService";
import type { EventError } from "./errors";

export interface IEventController {
  showCreateEvent(
    res: Response,
    session: IAppBrowserSession,
    pageError?: string | null
  ): Promise<void>;

  createEventFromForm(
    res: Response,
    input: Omit<CreateEventInput, "organizerId">,
    store: AppSessionStore
  ): Promise<void>;

    getEventDetail(
    res: Response,
    eventId: string,
    store: AppSessionStore
  ): Promise<void>;

  publishEventFromForm(
    res: Response,
    eventId: string,
    store: AppSessionStore
  ): Promise<void>;

  cancelEventFromForm(
    showEditEvent(
    res: Response,
    eventId: string,
    session: AppSessionStore,
    pageError?: string | null
  ): Promise<void>;

    updateEventFromForm(
    res: Response,
    eventId: string,
    input: Omit<CreateEventInput, "organizerId">,
    store: AppSessionStore
  ): Promise<void>;
}

class EventController implements IEventController {
  constructor(
    private readonly service: IEventService,
    private readonly logger: ILoggingService
  ) {}

  private mapErrorStatus(error: EventError): number {
    if (error.type === "ValidationError") return 400;
    return 500;
  }

  async showCreateEvent(
    res: Response,
    session: IAppBrowserSession,
    pageError: string | null = null
  ): Promise<void> {
    res.render("events/create", { pageError, session });
  }

  async createEventFromForm(
    res: Response,
    input: Omit<CreateEventInput, "organizerId">,
    store: AppSessionStore
  ): Promise<void> {
    const session = touchAppSession(store);
    const user = getAuthenticatedUser(store);

    if (!user) {
      this.logger.warn("Unauthorized event creation attempt");
      res.status(403);
      await this.showCreateEvent(res, session, "You must be logged in.");
      return;
    }

    const result = await this.service.createEvent({
      ...input,
      organizerId: user.userId,
    });

    if (result.ok === false) {
      const error = result.value;
      const status = this.mapErrorStatus(error);

      const log = status >= 500 ? this.logger.error : this.logger.warn;
      log.call(this.logger, `Event creation failed: ${error.message}`);

      res.status(status);
      await this.showCreateEvent(res, session, error.message);
      return;
    }

    this.logger.info(`Created event ${result.value.id}`);
    res.redirect(`/events/${result.value.id}`);
  }

  async getEventDetail(
  res: Response,
  eventId: string,
  store: AppSessionStore
): Promise<void> {
  const session = touchAppSession(store);
  const user = getAuthenticatedUser(store);

  const result = await this.service.getEventById(
    eventId,
    user?.userId
  );

  if (result.ok === false) {
    const error = result.value;

    const status =
      error.type === "NotFoundError" ? 404 : 500;

    const log = status >= 500 ? this.logger.error : this.logger.warn;
    log.call(this.logger, `Event detail failed: ${error.message}`);

    res.status(status).render("partials/error", {
      message: error.message,
      layout: false,
    });
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

  const result = await this.service.getEventById(
    eventId,
    user?.userId
  );

  if (!result.ok) {
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
    const session = touchAppSession(store);
    const user = getAuthenticatedUser(store);

    if (!user) {
      this.logger.warn("Unauthorized event update attempt");
      res.status(403);
      await this.showEditEvent(res, eventId, store, "You must be logged in.");
      return;
    }

    const result = await this.service.updateEvent(
      eventId,
      input,
      user.userId
    );

    if (result.ok === false) {
      const error = result.value;
      const status = this.mapErrorStatus(error);

      const log = status >= 500 ? this.logger.error : this.logger.warn;
      log.call(this.logger, `Event update failed: ${error.message}`);

      res.status(status);
      await this.showEditEvent(res, eventId, store, error.message);
      return;
    }

    this.logger.info(`Updated event ${eventId}`);
    res.redirect(`/events/${eventId}`);
  }

  async toggleRSVP(
    res: Response,
    eventId: string,
    store: AppSessionStore
  ): Promise<void> {
    const user = getAuthenticatedUser(store);

    if (!user) {
      res.status(403).render("partials/error", {
        message: "You must be logged in.",
        layout: false,
      });
      return;
    }

    const result = await this.service.cancelEvent(eventId, user.userId, user.role);

    if (result.ok === false) {
      const status = result.value.type === "NotFoundError" ? 404
        : result.value.type === "NotAuthorizedError" ? 403
        : 400;
      this.logger.warn(`Cancel failed for event ${eventId}: ${result.value.message}`);
      res.status(status).render("partials/error", {
        message: result.value.message,
        layout: false,
      });
      return;
    }

    this.logger.info(`Cancelled event ${eventId}`);
    res.redirect(`/events/${eventId}`);
  }
}

export function CreateEventController(
  service: IEventService,
  logger: ILoggingService
): IEventController {
  return new EventController(service, logger);
}