import { Module } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { SendGridWebhook } from './webhooks/sendgrid.webhook';

@Module({
  providers: [CommunicationsService, SendGridWebhook],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
