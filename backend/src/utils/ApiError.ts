class ApiError extends Error {
  private readonly statusCode: number;
  private readonly success: boolean;
  private readonly data: null;
  private readonly error: unknown[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.error = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
