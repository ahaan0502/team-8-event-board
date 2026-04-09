
### Method: getEventById

**Signature**
getEventById(eventId: string): Event

**Description**
Takes the event id and optionally the viewer id and returns the corresponding event.

**Parameters**
eventId: string

**Returns**
Event

**Success Criteria**
Returns the correct event corresponding to the id

**Errors**
failedToFetch: Fails to fetch the event


### Method: validateEventInput

**Signature**
validateEventInput(input: eventInput): void

**Description**
Validates the given eventInput 

**Parameters**
input: eventInput

**Returns**
void

**Success Criteria**
Returns true to confirm the eventInput is valid

**Errors**
invalidInput: input is not of valid type


### Method: toggleRSVP

**Signature**
toggleRSVP(eventId: string, userId: string): RSVPResult

**Description**
Toggles status of RSVP for given user and event

**Parameters**
eventId: string, userId: string

**Returns**
RSVPResult

**Success Criteria**
Appropriately toggles the RSVP status for a given user for a given event

**Errors**
RSVPToggleFail: fails to update the RSVP status of a user for an event


### Method: archiveExpiredEvents

**Signature**
archiveExpiredEvents(now: Date): Event[]

**Description**
Archives events that have expired

**Parameters**
now: Date

**Returns**
Event[]

**Success Criteria**
Expired events are archived from the published events

**Errors**
//Will be added upon implementation


### Method: listPublishedEvents

**Signature**
listPublishedEvents(filters: EventFilters): Event[]

**Description**
Returns all currently published events

**Parameters**
filters: EventFilters

**Returns**
Event[]

**Success Criteria**
Returns list of all currently published events

**Errors**
//Will be added upon implementation


### Method: assertEventOwner

**Signature**
assertEventOwner(event: Event, userId: string): void

**Description**
Verifies if a given user is the owner of a given event

**Parameters**
event: Event, userId: string

**Returns**
void

**Success Criteria**
Correctly verifies if a given user is the owner of a given event

**Errors**
failedToAssertOwner: Fails to retrieve relationship between a user and an event


### Method: getCurrentTime

**Signature**
getCurrentTime(): Date

**Description**
Returns the current date

**Parameters**
n/a

**Returns**
Date

**Success Criteria**
Returns the date at a current timestamp

**Errors**
failedToGetDate: Fails to return the correct date


### Method: getCurrentUserId

**Signature**
getCurrentUserId(): string

**Description**
Returns the current user's id

**Parameters**
n/a

**Returns**
string

**Success Criteria**
Returns the id of the current user

**Errors**
failedToRetrieveId: Fails to return the correct user id


### Method: <method_name>

**Signature**
<function signature>

**Description**
What the method does (1–2 sentences)

**Parameters**
<param_name> (<type>): Description

**Returns**
<type>: Description of successful result

**Success Criteria**
What defines a valid successful response
Any guarantees (e.g., non-null fields, ordering, constraints)

**Errors**
<ERROR_NAME>: Description of when this occurs
<ERROR_NAME>: Description
