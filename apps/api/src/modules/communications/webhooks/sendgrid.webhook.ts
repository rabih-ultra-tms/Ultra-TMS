import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

/**
 * SendGrid Webhook Controller
 * Handles incoming webhook events from SendGrid with signature validation
 *
 * SECURITY: All webhook events are logged but NOT persisted to the database
 * without proper tenantId isolation. This prevents cross-tenant data mutation.
 *
 * TODO: Future implementation should:
 * - Create sendgrid_webhook_events table to track raw events
 * - Process events async with proper tenantId lookup via email+domain
 * - Update notifications with verified tenantId isolation
 */
@Controller('/api/v1/communications/webhooks')
export class SendGridWebhook {
  private readonly logger = new Logger(SendGridWebhook.name);

  constructor(private config: ConfigService) {}

  /**
   * Validates SendGrid webhook signature
   * @see https://docs.sendgrid.com/for-developers/tracking/getting-started-event-webhook-security
   */
  private validateSignature(
    payload: string,
    signature: string,
    timestamp: string
  ): boolean {
    const key = this.config.get<string>('SENDGRID_WEBHOOK_VERIFICATION_KEY');
    if (!key) {
      this.logger.warn(
        'SENDGRID_WEBHOOK_VERIFICATION_KEY not configured - skipping validation'
      );
      return false;
    }

    const hash = crypto
      .createHmac('sha256', key)
      .update(timestamp + payload)
      .digest('base64');

    return hash === signature;
  }

  @Post('sendgrid')
  async handleSendGridEvent(
    @Body() payload: any,
    @Headers('x-twilio-email-event-webhook-signature') signature?: string,
    @Headers('x-twilio-email-event-webhook-timestamp') timestamp?: string
  ) {
    // Validate webhook signature if present
    if (signature && timestamp) {
      const payloadString = JSON.stringify(payload);
      const isValid = this.validateSignature(
        payloadString,
        signature,
        timestamp
      );
      if (!isValid) {
        this.logger.warn(
          'Invalid SendGrid webhook signature - rejecting request'
        );
        throw new UnauthorizedException('Invalid webhook signature');
      }
    } else {
      this.logger.warn(
        'SendGrid webhook missing signature headers - skipping validation'
      );
    }

    // Log all events for audit trail
    const events = Array.isArray(payload) ? payload : [payload];
    this.logger.log(`Received ${events.length} SendGrid event(s)`);

    for (const event of events) {
      this.logger.debug(
        `Event: type=${event.event}, email=${event.email}, timestamp=${event.timestamp}`
      );

      // TODO: Process events with proper tenantId isolation
      // Current limitation: email is not unique per tenant, so we cannot update DB safely
      // Future: Store raw events in sendgrid_webhook_events table, then process async
      // with proper tenantId lookup via email+domain resolution
      switch (event.event) {
        case 'bounce':
          this.logger.info(
            `Email bounced: ${event.email} (reason: ${event.reason})`
          );
          break;
        case 'delivered':
          this.logger.info(`Email delivered: ${event.email}`);
          break;
        case 'open':
          this.logger.debug(`Email opened: ${event.email}`);
          break;
        case 'click':
          this.logger.debug(`Email clicked: ${event.email}`);
          break;
        case 'dropped':
          this.logger.warn(
            `Email dropped: ${event.email} (reason: ${event.reason})`
          );
          break;
        case 'spamreport':
          this.logger.warn(`Email reported as spam: ${event.email}`);
          break;
        case 'unsubscribe':
          this.logger.info(`Email unsubscribed: ${event.email}`);
          break;
        default:
          this.logger.debug(`Unknown event type: ${event.event}`);
      }
    }

    return { received: true };
  }
}
