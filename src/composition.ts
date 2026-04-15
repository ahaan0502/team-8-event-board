import { CreateAdminUserService } from "./auth/AdminUserService";
import { CreateAuthController } from "./auth/AuthController";
import { CreateAuthService } from "./auth/AuthService";
import { CreateInMemoryUserRepository } from "./auth/InMemoryUserRepository";
import { CreatePasswordHasher } from "./auth/PasswordHasher";
import { CreateApp } from "./app";
import type { IApp } from "./contracts";
import { CreateLoggingService } from "./service/LoggingService";
import type { ILoggingService } from "./service/LoggingService";
import { CreateInMemoryEventRepository } from "./events/inMemoryEventRepository";
import { CreateEventService } from "./events/eventService";
import { CreateEventController } from "./events/eventController";
import { CreateInMemoryRsvpRepository, CreateAttendeeService } from "./rsvp/index";
import { CreateAttendeeController } from "./rsvp/attendeeController";

export function createComposedApp(logger?: ILoggingService): IApp {
  const resolvedLogger = logger ?? CreateLoggingService();

  // Authentication & authorization wiring
  const authUsers = CreateInMemoryUserRepository();
  const passwordHasher = CreatePasswordHasher();
  const authService = CreateAuthService(authUsers, passwordHasher);
  const adminUserService = CreateAdminUserService(authUsers, passwordHasher);
  const authController = CreateAuthController(authService, adminUserService, resolvedLogger);

  // Event wiring
  const eventRepo = CreateInMemoryEventRepository();
  const eventService = CreateEventService(eventRepo);
  const eventController = CreateEventController(eventService, resolvedLogger);

  // Attendee list wiring
  const rsvpRepo = CreateInMemoryRsvpRepository();
  const attendeeService = CreateAttendeeService(rsvpRepo, authUsers, eventService);
  const attendeeController = CreateAttendeeController(attendeeService, resolvedLogger);

  return CreateApp(authController, eventController, attendeeController, resolvedLogger);
}
