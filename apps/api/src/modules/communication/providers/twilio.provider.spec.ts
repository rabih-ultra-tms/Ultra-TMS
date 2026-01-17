import { TwilioProvider } from './twilio.provider';
import { ConfigService } from '@nestjs/config';

describe('TwilioProvider', () => {
  const createProvider = (config: Record<string, string>) => {
    const configService = {
      get: jest.fn((key: string) => config[key]),
    } as unknown as ConfigService;

    return new TwilioProvider(configService);
  };

  it('formats phone numbers consistently', () => {
    const provider = createProvider({});

    expect(provider.formatPhoneNumber('(555) 000-1234')).toBe('+15550001234');
    expect(provider.formatPhoneNumber('15550001234')).toBe('+15550001234');
    expect(provider.formatPhoneNumber('+15550001234')).toBe('+15550001234');
  });

  it('parses inbound message with media', () => {
    const provider = createProvider({});

    const result = provider.parseInboundMessage({
      MessageSid: 'sid-1',
      From: '+1555',
      To: '+1666',
      Body: 'Hello',
      NumMedia: '2',
      MediaUrl0: 'http://media/0',
      MediaUrl1: 'http://media/1',
    });

    expect(result).toEqual({
      messageId: 'sid-1',
      from: '+1555',
      to: '+1666',
      body: 'Hello',
      mediaUrls: ['http://media/0', 'http://media/1'],
    });
  });

  it('mocks send when not configured', async () => {
    const provider = createProvider({
      TWILIO_ACCOUNT_SID: '',
      TWILIO_AUTH_TOKEN: '',
      TWILIO_PHONE_NUMBER: '',
    });

    const result = await provider.sendSms({ to: '+1555', body: 'Hi' });

    expect(result.success).toBe(true);
    expect(result.status).toBe('sent');
    expect(result.messageId).toEqual(expect.stringContaining('SM'));
  });
});
