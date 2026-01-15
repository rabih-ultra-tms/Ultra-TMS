import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CORRELATION_ID_HEADER } from './correlation-id.middleware';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '-';
    const correlationId = req.headers[CORRELATION_ID_HEADER] || '-';
    const startTime = Date.now();

    this.logger.log(
      `[${correlationId}] --> ${method} ${originalUrl} ${ip} ${userAgent}`,
    );

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const contentLength = res.get('content-length') || 0;

      const logMessage = `[${correlationId}] <-- ${method} ${originalUrl} ${statusCode} ${duration}ms ${contentLength}b`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
