export function ValidationError(message: string) {
  return { type: "ValidationError" as const, message };
}

export function NotFoundError(message: string) {
  return { type: "NotFoundError" as const, message };
}

export function UnauthorizedError(message: string) {
  return { type: "UnauthorizedError" as const, message };
}

export function InvalidTimeRangeError(message: string) {
  return { type: "InvalidTimeRangeError" as const, message };
}

export function InvalidCapacityError(message: string) {
  return { type: "InvalidCapacityError" as const, message };
}

export function InvalidStateError(message: string) {
  return { type: "InvalidStateError" as const, message };
}

export function NotAuthorizedError(message: string) {
  return { type: "NotAuthorizedError" as const, message };
}

export type EventError =
  | ReturnType<typeof ValidationError>
  | ReturnType<typeof NotFoundError>
  | ReturnType<typeof UnauthorizedError>
  | ReturnType<typeof NotAuthorizedError>
  | ReturnType<typeof InvalidTimeRangeError>
  | ReturnType<typeof InvalidCapacityError>
  | ReturnType<typeof InvalidStateError>;
