import type { ApiResponsePayload } from "../types/types";

class ApiResponse<TData = unknown> implements ApiResponsePayload<TData> {
  public readonly statusCode: number;
  public readonly data: TData;
  public readonly message: string;
  public readonly success: boolean;

  public constructor(
    statusCode: number,
    data: TData,
    message: string = "Success",
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
