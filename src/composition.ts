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
import { CreateEventController } from "./events/eventController";
import { CreateEventService } from "./events/eventService";
import { CreateOrganizerDashboardService } from "./events/OrganizerDashboardService";
import { OrganizerDashboardController } from "./events/OrganizerDashboardController";
import { PrismaEventRepository } from "./events/prismaEventRepository";
import { PrismaRSVPRepository } from "./events/prismaRSVPRepository";
import { RSVPDashboardController } from "./rsvps/RSVPDashboardController";
import { CreateRSVPDashboardService } from "./rsvps/RSVPDashboardService";
import { CreateLoggingService } from "./service/LoggingService";
import type { ILoggingService } from "./service/LoggingService";
import { CreateRSVPService } from "./events/rsvpService";

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

  // Event wiring (Prisma — Feature 8 and shared event reads)
  const eventRepo = new PrismaEventRepository();
  const eventService = CreateEventService(eventRepo);

  // RSVP wiring — one Prisma repo for toggles, My RSVPs (Feature 7), organizer counts (Feature 8)
  const rsvpRepo = new PrismaRSVPRepository();
  const rsvpService = CreateRSVPService(rsvpRepo, eventRepo);

  const eventController = CreateEventController(
    eventService,
    rsvpService,
    resolvedLogger
  );

  // Attendee list wiring
  const attendeeService = CreateAttendeeService(rsvpRepo, authUsers, eventService);
  const attendeeController = CreateAttendeeController(attendeeService, resolvedLogger);

  // RSVP dashboard wiring (Feature 7)
  const rsvpDashboardService = CreateRSVPDashboardService(rsvpRepo, eventRepo);
  const rsvpDashboardController = new RSVPDashboardController(
    rsvpDashboardService
  );

  // Organizer dashboard wiring (Feature 8)
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
