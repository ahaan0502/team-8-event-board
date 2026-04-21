export type EventError =
  | ReturnType<typeof ValidationError>
  | ReturnType<typeof NotFoundError>
  | ReturnType<typeof UnauthorizedError>;
  | ReturnType<typeof InvalidTimeRangeError>
  | ReturnType<typeof InvalidCapacityError>;

export function ValidationError(message: string) {
  return {
    type: "ValidationError",
    message,
  };
}

export function UnauthorizedError(message: string) {
  return { type: "UnauthorizedError", message };
}

export function InvalidTimeRangeError(message: string) {
  return {
    type: "ValidationError",
    message,
  };
}

export function InvalidCapacityError(message: string) {
  return {
    type: "ValidationError",
    message,
  };
}


export function NotFoundError(message: string): EventError {
  return { type: "NotFoundError", message };
}