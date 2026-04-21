import type { Response } from "express";
import type { IAttendeeService } from "./attendeeService";
import type { AppSessionStore } from "../session/AppSession";
import { getAuthenticatedUser, touchAppSession } from "../session/AppSession";
import type { ILoggingService } from "../service/LoggingService";

export interface IAttendeeController {
  showAttendeeList(
    res: Response,
    eventId: string,
    store: AppSessionStore
  ): Promise<void>;
}

class AttendeeController implements IAttendeeController {
  constructor(
    private readonly service: IAttendeeService,
    private readonly logger: ILoggingService
  ) {}

  async showAttendeeList(
    res: Response,
    eventId: string,
    store: AppSessionStore
  ): Promise<void> {
    const session = touchAppSession(store);
    const user = getAuthenticatedUser(store);

    if (!user) {
      res.status(403).render("partials/error", {
        message: "You must be logged in.",
        layout: false,
      });
      return;
    }

    const result = await this.service.getAttendeeList(eventId, user.userId, user.role);

    if (result.ok === false) {
      const status =
        result.value.type === "NotFoundError" ? 404
        : result.value.type === "NotAuthorizedError" ? 403
        : 400;
      this.logger.warn(`Attendee list failed for event ${eventId}: ${result.value.message}`);
      res.status(status).render("partials/error", {
        message: result.value.message,
        layout: false,
      });
      return;
    }

    this.logger.info(`Attendee list viewed for event ${eventId} by ${user.userId}`);
    res.render("events/attendees", { attendees: result.value, eventId, session });
  }
}

export function CreateAttendeeController(
  service: IAttendeeService,
  logger: ILoggingService
): IAttendeeController {
  return new AttendeeController(service, logger);
}
