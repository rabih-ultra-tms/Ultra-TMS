import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';

// Controllers
import { TemplatesController } from './templates.controller';
import { EmailController } from './email.controller';
import { SmsController } from './sms.controller';
import { NotificationsController } from './notifications.controller';
import { PreferencesController } from './preferences.controller';

// Services
import { TemplatesService } from './templates.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { NotificationsService } from './notifications.service';
import { PreferencesService } from './preferences.service';

// Providers
import { SendGridProvider } from './providers/sendgrid.provider';
import { TwilioProvider } from './providers/twilio.provider';

@Module({
  imports: [ConfigModule],
  controllers: [
    TemplatesController,
    EmailController,
    SmsController,
    NotificationsController,
    PreferencesController,
  ],
  providers: [
    PrismaService,
    // Providers
    SendGridProvider,
    TwilioProvider,
    // Services
    TemplatesService,
    EmailService,
    SmsService,
    NotificationsService,
    PreferencesService,
  ],
  exports: [
    // Export services for use in other modules
    TemplatesService,
    EmailService,
    SmsService,
    NotificationsService,
    PreferencesService,
    SendGridProvider,
    TwilioProvider,
  ],
})
export class CommunicationModule {}
