import express from "express";
import type { IEventController } from "./eventController";

export function eventRoutes(controller: IEventController) {
  const router = express.Router();

  router.get("/events", async (req, res) => {
    await controller.listEvents(req, res);
  });

  return router;
}
