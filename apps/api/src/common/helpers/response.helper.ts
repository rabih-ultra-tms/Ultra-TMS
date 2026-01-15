import {
  ApiResponse,
  ErrorResponse,
  PaginatedResponse,
  PaginationResult,
} from '../interfaces/response.interface';

export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  };
}

export function created<T>(
  data: T,
  message = 'Resource created successfully',
): ApiResponse<T> {
  return ok(data, message);
}

export function updated<T>(
  data: T,
  message = 'Resource updated successfully',
): ApiResponse<T> {
  return ok(data, message);
}

export function deleted(message = 'Resource deleted successfully'): ApiResponse<null> {
  return ok(null, message);
}

export function error(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}

export function batch<T>(
  results: { success: T[]; failed: Array<{ item: unknown; error: string }> },
  message?: string,
): ApiResponse<typeof results> {
  return ok(
    results,
    message ||
      `Processed ${results.success.length} items, ${results.failed.length} failed`,
  );
}

export function fromPaginationResult<T>(
  result: PaginationResult<T>,
): PaginatedResponse<T> {
  return paginated(result.data, result.total, result.page, result.limit);
}
