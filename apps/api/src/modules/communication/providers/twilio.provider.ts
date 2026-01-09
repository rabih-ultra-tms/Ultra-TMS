import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TwilioSmsOptions {
  to: string;
  body: string;
  from?: string;
  mediaUrls?: string[];
  statusCallback?: string;
}

export interface TwilioResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  status?: string;
}

export interface TwilioInboundMessage {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
  MediaUrl0?: string;
  MediaUrl1?: string;
  MediaUrl2?: string;
}

@Injectable()
export class TwilioProvider {
  private readonly logger = new Logger(TwilioProvider.name);
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly phoneNumber: string;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.accountSid =
      this.configService.get<string>('TWILIO_ACCOUNT_SID') || '';
    this.authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN') || '';
    this.phoneNumber =
      this.configService.get<string>('TWILIO_PHONE_NUMBER') || '';
    this.isConfigured =
      !!this.accountSid && !!this.authToken && !!this.phoneNumber;

    if (!this.isConfigured) {
      this.logger.warn(
        'Twilio is not configured. SMS sending will be mocked.',
      );
    }
  }

  async sendSms(options: TwilioSmsOptions): Promise<TwilioResponse> {
    if (!this.isConfigured) {
      return this.mockSendSms(options);
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString(
        'base64',
      );

      const body = new URLSearchParams({
        To: options.to,
        From: options.from || this.phoneNumber,
        Body: options.body,
      });

      // Add media URLs if present (MMS)
      if (options.mediaUrls && options.mediaUrls.length > 0) {
        options.mediaUrls.forEach((url) => {
          body.append('MediaUrl', url);
        });
      }

      if (options.statusCallback) {
        body.append('StatusCallback', options.statusCallback);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = (await response.json()) as { sid?: string; status?: string; message?: string };

      if (response.ok) {
        this.logger.log(`SMS sent successfully to ${options.to}: ${data.sid}`);
        return {
          success: true,
          messageId: data.sid,
          status: data.status,
        };
      } else {
        this.logger.error(`Twilio error: ${data.message}`);
        return {
          success: false,
          error: data.message,
        };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Twilio send failed: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  private mockSendSms(options: TwilioSmsOptions): TwilioResponse {
    const mockId = `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    this.logger.log(
      `[MOCK] SMS sent to ${options.to}: "${options.body.substring(0, 50)}..." (ID: ${mockId})`,
    );
    return { success: true, messageId: mockId, status: 'sent' };
  }

  parseInboundMessage(body: TwilioInboundMessage): {
    messageId: string;
    from: string;
    to: string;
    body: string;
    mediaUrls: string[];
  } {
    const mediaUrls: string[] = [];
    const numMedia = parseInt(body.NumMedia || '0', 10);

    for (let i = 0; i < numMedia; i++) {
      const mediaKey = `MediaUrl${i}` as keyof TwilioInboundMessage;
      if (body[mediaKey]) {
        mediaUrls.push(body[mediaKey] as string);
      }
    }

    return {
      messageId: body.MessageSid,
      from: body.From,
      to: body.To,
      body: body.Body,
      mediaUrls,
    };
  }

  formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Add country code if missing (assume US)
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }

    // Return with + if not already present
    return phone.startsWith('+') ? phone : `+${cleaned}`;
  }

  getDefaultPhoneNumber(): string {
    return this.phoneNumber;
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}
