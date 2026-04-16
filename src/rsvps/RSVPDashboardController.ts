import type { Request, Response } from "express";
import type { IRSVPDashboardService } from "./RSVPDashboardService";

export class RSVPDashboardController {
  constructor(private readonly service: IRSVPDashboardService) {}

  async getMyRsvpsPage(
    req: Request,
    res: Response,
    userId: string,
    browserSession: unknown
  ): Promise<void> {
    const result = await this.service.getMyRsvpsDashboard(userId);

    if (!result.ok) {
      res.status(500).send("Failed to load dashboard");
      return;
    }

    res.render("rsvps/dashboard", {
      session: browserSession,
      dashboard: result.value,
      pageError: null,
    });
  }
}