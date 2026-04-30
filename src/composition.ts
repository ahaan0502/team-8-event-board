import { CreateAdminUserService } from "./auth/AdminUserService";
import { CreateAuthController } from "./auth/AuthController";
import { CreateAuthService } from "./auth/AuthService";
import { CreateInMemoryUserRepository } from "./auth/InMemoryUserRepository";
import { CreatePasswordHasher } from "./auth/PasswordHasher";
import { CreateApp } from "./app";
import { CreateAttendeeService } from "./rsvp/attendeeService";
import { CreateAttendeeController } from "./rsvp/attendeeController";
import type { IAttendeeController } from "./rsvp/attendeeController";
import type { IApp } from "./contracts";
import { InMemoryEventRepository } from "./events/inMemoryEventRepository";
import { CreateEventController } from "./events/eventController";
import { CreateEventService } from "./events/eventService";
import { CreateOrganizerDashboardService } from "./events/OrganizerDashboardService";
import { OrganizerDashboardController } from "./events/OrganizerDashboardController";
import { InMemoryRSVPRepository } from "./rsvps/InMemoryRSVPRepository";
import { RSVPDashboardController } from "./rsvps/RSVPDashboardController";
import { CreateRSVPDashboardService } from "./rsvps/RSVPDashboardService";
import { CreateLoggingService } from "./service/LoggingService";
import type { ILoggingService } from "./service/LoggingService";
import { CreateRSVPRepository } from "./events/rsvpRepository";
import { CreateRSVPService } from "./events/rsvpService";
<<<<<<< HEAD
import { PrismaEventRepository } from "./events/prismaEventRepository";
import { PrismaRSVPRepository } from "./rsvps/PrismaRSVPRepository";
=======
>>>>>>> dev

export function createComposedApp(logger?: ILoggingService): IApp {
  const resolvedLogger = logger ?? CreateLoggingService();

  // Authentication & authorization wiring
  const authUsers = CreateInMemoryUserRepository();
  const passwordHasher = CreatePasswordHasher();
  const authService = CreateAuthService(authUsers, passwordHasher);
  const adminUserService = CreateAdminUserService(authUsers, passwordHasher);
  const authController = CreateAuthController(
    authService,
    adminUserService,
    resolvedLogger
  );

  // Event wiring
  const eventRepo = new InMemoryEventRepository();
  const eventService = CreateEventService(eventRepo);

<<<<<<< HEAD
  // RSVP wiring (single repo)
  const rsvpRepo = new PrismaRSVPRepository();
=======
  // RSVP wiring
  const rsvpRepo = CreateRSVPRepository();
>>>>>>> dev
  const rsvpService = CreateRSVPService(rsvpRepo, eventRepo);

  const eventController = CreateEventController(
    eventService,
    rsvpService,
    resolvedLogger
  );

  // Attendee list wiring
  const attendeeService = CreateAttendeeService(rsvpRepo, authUsers, eventService);
  const attendeeController = CreateAttendeeController(attendeeService, resolvedLogger);

<<<<<<< HEAD
  // RSVP dashboard wiring (use SAME repo)
  const rsvpDashboardService = CreateRSVPDashboardService(
    rsvpRepo,
=======
  // RSVP dashboard wiring
  const dashboardRsvpRepo = new InMemoryRSVPRepository();
  const rsvpDashboardService = CreateRSVPDashboardService(
    dashboardRsvpRepo,
>>>>>>> dev
    eventRepo
  );
  const rsvpDashboardController = new RSVPDashboardController(
    rsvpDashboardService
  );

  // Organizer dashboard wiring (use SAME repo)
  const organizerDashboardService = CreateOrganizerDashboardService(
    eventRepo,
    rsvpRepo
  );
  const organizerDashboardController = new OrganizerDashboardController(
    organizerDashboardService
  );

  return CreateApp(
    authController,
    eventController,
    rsvpDashboardController,
    organizerDashboardController,
    attendeeController,
    resolvedLogger
  );
}
