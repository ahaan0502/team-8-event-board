This document defines the shared service-layer contracts for the Local Event Board application.
All service methods follow the Result<T, E> pattern and do not access HTTP or session state directly.

Shared Types
    Result Type
        type Result<T, E> =
            | { ok: true; value: T }
            | { ok: false; error: E }

    EventInput
        type EventInput = {
            title: string
            description: string
            location: string
            category: string
            startTime: Date
            endTime: Date
            capacity: number
        }

    CreateEventInput
        type CreateEventInput = EventInput & {
            organizerId: string
        }

    EventFilters
        type EventFilters = {
            category?: string
            timeframe?: "all" | "week" | "weekend"
            query?: string
        }

    EventStatus
        type EventStatus =
            | "draft"
            | "published"
            | "cancelled"
            | "past"

    Event
        type Event = {
            id: string
            title: string
            description: string
            location: string
            category: string
            startTime: Date
            endTime: Date
            capacity: number
            organizerId: string
            status: EventStatus
        }        

    RSVP
        type RSVP = {
            id: string
            eventId: string
            userId: string
            status: "going" | "waitlisted" | "cancelled"
            createdAt: Date
        }    

    Error Types
        type ValidationError = {
            type: "ValidationError"
            message: string
        }

        type NotFoundError = {
            type: "NotFoundError"
            message: string
        }

        type NotAuthorizedError = {
            type: "NotAuthorizedError"
            message: string
        }

        type InvalidStateError = {
            type: "InvalidStateError"
            message: string
        }
    
    Event Errors
        type EventError =
            | ValidationError
            | NotFoundError
            | NotAuthorizedError
            | InvalidStateError

    RSVP Errors
        type RSVPError =
            | ValidationError
            | NotFoundError
            | NotAuthorizedError
            | InvalidStateError


Event Contracts
    Method: createEvent

        Signature: createEvent(input: CreateEventInput): Promise<Result<Event, EventError>>

        Description: Creates a new event in draft status after validating input.

        Errors: ValidationError: invalid or missing fields

    Method: getEventById

        Signature: getEventById(eventId: string): Promise<Result<Event, EventError>>

        Description: Retrieves a single event by its ID.

        Parameters: eventId: string

        Returns: Result containing the Event if found

        Errors: NotFoundError

    Method: validateEventInput

        Signature: validateEventInput(input: EventInput): Result<void, ValidationError>

        Description: Validates event input fields

        Parameters: input: EventInput

        Returns: Success if input is valid

        Errors: ValidationError: invalid or missing fields

    Method: updateEvent

        Signature: updateEvent(eventId: string, input: EventInput,
            actingUserId: string): Promise<Result<Event, EventError>>

        Description: Updates an existing event if the acting user is authorized and the event is in a valid state.

        Parameters: eventId: string, input: EventInput, actingUserId: string

        Returns: Updated Event

        Errors: ValidationError, NotFoundError, NotAuthorizedError, InvalidStateError

    Method: listPublishedEvents

        Signature: listPublishedEvents(filters: EventFilters): Promise<Result<Event[], EventError>>

        Description: Returns all published events matching the given filters.

        Parameters: filters: EventFilters

        Returns: List of published events

        Errors: ValidationError: invalid filter values
                InvalidSearchError: search query exceeds 200 characters

    Method: archiveExpiredEvents

        Signature: archiveExpiredEvents(now: Date): Promise<Result<Event[], never>>

        Description: Transitions expired events into "past" status and returns them.

        Parameters: now: Date

        Returns: List of archived events

        Errors: None

    Method: assertEventOwner

        Signature: assertEventOwner(event: Event, userId: string): Promise<void, EventError>

        Description: Checks whether a user is the owner of an event.

        Parameters: event: Event, userId: string

        Returns: Success if user is the owner

        Errors: NotAuthorizedError: user is not the event owner

RSVP Contracts
    
    Method: toggleRSVP

        Signature: toggleRSVP(eventId: string, userId: string): Promise<Result<RSVP, RSVPError>>

    Description: Toggles RSVP status for a user on an event.

    Behavior: If no RSVP exists:
        Create RSVP as "going" if capacity allows
        Otherwise create as "waitlisted"
        If RSVP exists and is active:
        Change status to "cancelled"
        If RSVP exists and is cancelled:
        Reactivate as "going" or "waitlisted"

    Parameters: eventId: string, userId: string

    Returns: Updated RSVP object

    Errors: ValidationError, NotFoundError, NotAuthorizedError, InvalidStateError
