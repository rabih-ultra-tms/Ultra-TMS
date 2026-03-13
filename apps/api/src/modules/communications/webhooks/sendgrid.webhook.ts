import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Controller('/api/v1/communications/webhooks')
export class SendGridWebhook {
  constructor(private prisma: PrismaService) {}

  @Post('sendgrid')
  async handleSendGridEvent(@Body() payload: any) {
    const events = payload;

    for (const event of events) {
      if (event.event === 'bounce') {
        await this.prisma.notification.updateMany({
          where: { email: event.email },
          data: { status: 'bounced' },
        });
      } else if (event.event === 'delivered') {
        await this.prisma.notification.updateMany({
          where: { email: event.email },
          data: { status: 'delivered' },
        });
      }
    }

    return { received: true };
  }
}
