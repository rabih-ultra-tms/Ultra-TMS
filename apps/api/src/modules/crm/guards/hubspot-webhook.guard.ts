import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Guard that verifies HubSpot webhook signatures.
 *
 * HubSpot signs webhook payloads using the app's client secret:
 *   signature = sha256(clientSecret + requestBody)
 *
 * The signature is sent in the `X-HubSpot-Signature` header.
 *
 * Behavior:
 * - If HUBSPOT_CLIENT_SECRET is not configured, logs a warning and allows
 *   the request through (dev/test convenience).
 * - If configured, verifies the signature and rejects with 401 on mismatch.
 */
@Injectable()
export class HubspotWebhookGuard implements CanActivate {
  private readonly logger = new Logger(HubspotWebhookGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-hubspot-signature'] as
      | string
      | undefined;

    const clientSecret = this.configService.get<string>(
      'HUBSPOT_CLIENT_SECRET',
    );

    if (!clientSecret) {
      this.logger.warn(
        'HUBSPOT_CLIENT_SECRET is not configured — skipping webhook signature verification. ' +
          'Set this variable in production to secure the webhook endpoint.',
      );
      return true;
    }

    if (!signature) {
      this.logger.warn(
        'HubSpot webhook request missing X-HubSpot-Signature header',
      );
      throw new UnauthorizedException(
        'Missing X-HubSpot-Signature header',
      );
    }

    // We need the raw request body string for signature verification.
    // NestJS with rawBody: true stores it on request.rawBody.
    const rawBody: Buffer | string | undefined = request.rawBody;
    const bodyString =
      rawBody instanceof Buffer
        ? rawBody.toString('utf8')
        : typeof rawBody === 'string'
          ? rawBody
          : JSON.stringify(request.body);

    const expectedHash = crypto
      .createHash('sha256')
      .update(clientSecret + bodyString)
      .digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    const sigBuffer = Buffer.from(signature, 'utf8');
    const hashBuffer = Buffer.from(expectedHash, 'utf8');

    if (
      sigBuffer.length !== hashBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, hashBuffer)
    ) {
      this.logger.warn('HubSpot webhook signature verification failed');
      throw new UnauthorizedException('Invalid HubSpot webhook signature');
    }

    return true;
  }
}
