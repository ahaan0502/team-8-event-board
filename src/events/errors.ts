export type EventError =
  | ReturnType<typeof ValidationError>
  | ReturnType<typeof NotFoundError>
  | ReturnType<typeof NotAuthorizedError>
  | ReturnType<typeof InvalidStateError>;

export function ValidationError(message: string) {
  return { type: "ValidationError" as const, message };
}

export function NotFoundError(message: string) {
  return { type: "NotFoundError" as const, message };
}

export function NotAuthorizedError(message: string) {
  return { type: "NotAuthorizedError" as const, message };
}

export function InvalidStateError(message: string) {
  return { type: "InvalidStateError" as const, message };
}
