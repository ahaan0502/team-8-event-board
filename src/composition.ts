import { CreateAdminUserService } from "./auth/AdminUserService";
import { CreateAuthController } from "./auth/AuthController";
import { CreateAuthService } from "./auth/AuthService";
import { CreateInMemoryUserRepository } from "./auth/InMemoryUserRepository";
import { CreatePasswordHasher } from "./auth/PasswordHasher";
import { CreateApp } from "./app";
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
import { CreateInMemoryEventRepository } from "./events/inMemoryEventRepository";
import { CreateEventService } from "./events/eventService";
import { CreateEventController } from "./events/eventController";
import { CreateRSVPRepository } from "./events/rsvpRepository";
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

  // Event wiring
  const eventRepo = new InMemoryEventRepository();
  const eventService = CreateEventService(eventRepo);
  const eventController = CreateEventController(eventService, resolvedLogger);

  // RSVP dashboard wiring
  const rsvpRepo = new InMemoryRSVPRepository();
  const rsvpDashboardService = CreateRSVPDashboardService(rsvpRepo, eventRepo);
  const rsvpDashboardController = new RSVPDashboardController(
    rsvpDashboardService
  );

  // Organizer dashboard wiring
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
    resolvedLogger
  );
}
