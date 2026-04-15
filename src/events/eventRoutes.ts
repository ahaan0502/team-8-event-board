import express from "express";
import type { IEventController } from "./eventController";
import type { AppSessionStore } from "../session/AppSession";
import { touchAppSession } from "../session/AppSession";

export function eventRoutes(controller: IEventController) {
  const router = express.Router();

  router.get("/events/new", async (req, res) => {
    const session = touchAppSession(req.session as AppSessionStore);
    await controller.showCreateEvent(res, session);
  });

  router.post("/events", async (req, res) => {
    await controller.createEventFromForm(
      res,
      {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        category: req.body.category,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        capacity: Number(req.body.capacity),
      },
      req.session as AppSessionStore
    );
  });

  router.get("/events/:id", async (req, res) => {
    await controller.showEventDetail(res, req.params.id, req.session as AppSessionStore);
  });

  router.post("/events/:id/publish", async (req, res) => {
    await controller.publishEventFromForm(res, req.params.id, req.session as AppSessionStore);
  });

  router.post("/events/:id/cancel", async (req, res) => {
    await controller.cancelEventFromForm(res, req.params.id, req.session as AppSessionStore);
  });

  return router;
}
