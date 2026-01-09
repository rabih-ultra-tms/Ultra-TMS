import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendGridEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  attachments?: Array<{
    content: string; // Base64 encoded
    filename: string;
    type?: string;
    disposition?: string;
  }>;
  trackingSettings?: {
    clickTracking?: boolean;
    openTracking?: boolean;
  };
}

export interface SendGridResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class SendGridProvider {
  private readonly logger = new Logger(SendGridProvider.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY') || '';
    this.fromEmail =
      this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
      'noreply@ultratms.com';
    this.fromName =
      this.configService.get<string>('SENDGRID_FROM_NAME') || 'Ultra-TMS';
    this.isConfigured = !!this.apiKey;

    if (!this.isConfigured) {
      this.logger.warn(
        'SendGrid is not configured. Email sending will be mocked.',
      );
    }
  }

  async sendEmail(options: SendGridEmailOptions): Promise<SendGridResponse> {
    if (!this.isConfigured) {
      return this.mockSendEmail(options);
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: options.to, name: options.toName }],
            },
          ],
          from: {
            email: options.from || this.fromEmail,
            name: options.fromName || this.fromName,
          },
          reply_to: options.replyTo
            ? { email: options.replyTo }
            : undefined,
          subject: options.subject,
          content: [
            options.text ? { type: 'text/plain', value: options.text } : null,
            options.html ? { type: 'text/html', value: options.html } : null,
          ].filter(Boolean),
          attachments: options.attachments,
          tracking_settings: {
            click_tracking: {
              enable: options.trackingSettings?.clickTracking ?? true,
            },
            open_tracking: {
              enable: options.trackingSettings?.openTracking ?? true,
            },
          },
        }),
      });

      if (response.ok) {
        const messageId = response.headers.get('x-message-id') || undefined;
        this.logger.log(`Email sent successfully to ${options.to}`);
        return { success: true, messageId };
      } else {
        const errorBody = await response.text();
        this.logger.error(`SendGrid error: ${response.status} - ${errorBody}`);
        return { success: false, error: errorBody };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`SendGrid send failed: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  private mockSendEmail(options: SendGridEmailOptions): SendGridResponse {
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.logger.log(
      `[MOCK] Email sent to ${options.to}: "${options.subject}" (ID: ${mockId})`,
    );
    return { success: true, messageId: mockId };
  }

  getDefaultFromEmail(): string {
    return this.fromEmail;
  }

  getDefaultFromName(): string {
    return this.fromName;
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}
