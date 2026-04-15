import express from "express";
import type { IAttendeeController } from "./attendeeController";
import type { AppSessionStore } from "../session/AppSession";

export function attendeeRoutes(controller: IAttendeeController) {
  const router = express.Router();

  router.get("/events/:id/attendees", async (req, res) => {
    await controller.showAttendeeList(
      res,
      req.params.id,
      req.session as AppSessionStore
    );
  });

  return router;
}
