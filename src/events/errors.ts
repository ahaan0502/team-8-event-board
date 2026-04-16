export type EventError =
  | ReturnType<typeof ValidationError>;

export function ValidationError(message: string) {
  return {
    type: "ValidationError",
    message,
  };
}

export function NotFoundError(message: string): EventError {
  return { type: "NotFoundError", message };
}