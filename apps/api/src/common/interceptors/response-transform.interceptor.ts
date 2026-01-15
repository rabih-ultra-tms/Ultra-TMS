import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ok, paginated } from '../helpers/response.helper';

interface PaginationShape<T> {
  data?: T[];
  items?: T[];
  total?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        if (response instanceof StreamableFile || Buffer.isBuffer(response)) {
          return response;
        }

        if (response?.success === true || response?.success === false) {
          return response;
        }

        if (response && typeof response === 'object') {
          const pagination = response as PaginationShape<unknown>;
          const hasPaginationFields =
            (Array.isArray(pagination.data) || Array.isArray(pagination.items)) &&
            typeof pagination.total === 'number' &&
            typeof pagination.page === 'number' &&
            typeof pagination.limit === 'number';

          if (hasPaginationFields) {
            const data = pagination.data ?? pagination.items ?? [];
            return paginated(data, pagination.total!, pagination.page!, pagination.limit!);
          }

          if (
            response.pagination &&
            typeof response.pagination === 'object' &&
            typeof response.pagination.page === 'number' &&
            typeof response.pagination.limit === 'number' &&
            typeof response.pagination.total === 'number'
          ) {
            return paginated(
              (response as { data?: unknown[] }).data ?? [],
              response.pagination.total,
              response.pagination.page,
              response.pagination.limit,
            );
          }

          if ('data' in response && !('pagination' in response)) {
            const message =
              typeof response.message === 'string' ? response.message : undefined;
            return ok((response as { data: unknown }).data, message);
          }
        }

        return ok(response ?? null);
      }),
    );
  }
}
