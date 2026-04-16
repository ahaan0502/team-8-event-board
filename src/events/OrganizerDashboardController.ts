import type { Request, Response } from "express";
import type { IOrganizerDashboardService } from "./OrganizerDashboardService";

export class OrganizerDashboardController {
  constructor(private readonly service: IOrganizerDashboardService) {}

  async getOrganizerDashboardPage(
    req: Request,
    res: Response,
    organizerId: string,
    browserSession: unknown
  ): Promise<void> {
    const result = await this.service.getOrganizerDashboard(organizerId);

    if (!result.ok) {
      res.status(500).send("Failed to load organizer dashboard");
      return;
    }

    res.render("events/organizer-dashboard", {
      session: browserSession,
      dashboard: result.value,
      pageError: null,
    });
  }
}