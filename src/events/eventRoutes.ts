import express from "express";
import type { IEventController } from "./eventController";
import type { AppSessionStore } from "../session/AppSession";
import { touchAppSession } from "../session/AppSession";

export function eventRoutes(
  controller: IEventController,
  store: AppSessionStore
) {
  const router = express.Router();

  router.get("/events/new", async (req, res) => {
    const session = touchAppSession(store);
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
      store
    );
  });

  router.get("/events/:id", async (req, res) => {
    await controller.getEventDetail(
      res,
      req.params.id,
      store
    );
  });

  router.get("/events/:id/edit", async (req, res) => {
    const session = touchAppSession(store);

    await controller.showEditEvent(
      res,
      req.params.id,
      store
    );
  });

  router.post("/events/:id", async (req, res) => {
    await controller.updateEventFromForm(
      res,
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        category: req.body.category,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        capacity: Number(req.body.capacity),
      },
      store
    );
});

router.post("/events/:id/rsvp", async (req, res) => {
  await controller.toggleRSVP(res, req.params.id, store);
});

  return router;
}