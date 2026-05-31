export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function notFound(resource: string): ApiError {
  return new ApiError(404, `${resource} nao encontrado`);
}
