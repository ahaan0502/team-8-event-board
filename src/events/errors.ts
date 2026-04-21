export type EventError =
  | ReturnType<typeof ValidationError>
  | ReturnType<typeof NotFoundError>
  | ReturnType<typeof UnauthorizedError>;

export function UnauthorizedError(message: string) {
  return { type: "UnauthorizedError", message };
}

export function ValidationError(message: string) {
  return {
    type: "ValidationError",
    message,
  };
}

export function NotFoundError(message: string) {
  return { type: "NotFoundError", message };
}