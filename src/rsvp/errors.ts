export type RsvpError =
  | ReturnType<typeof RsvpNotFoundError>
  | ReturnType<typeof RsvpNotAuthorizedError>
  | ReturnType<typeof RsvpInvalidStateError>;

export function RsvpNotFoundError(message: string) {
  return { type: "RsvpNotFoundError" as const, message };
}

export function RsvpNotAuthorizedError(message: string) {
  return { type: "RsvpNotAuthorizedError" as const, message };
}

export function RsvpInvalidStateError(message: string) {
  return { type: "RsvpInvalidStateError" as const, message };
}
