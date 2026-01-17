import { SendGridProvider } from './sendgrid.provider';
import { ConfigService } from '@nestjs/config';

describe('SendGridProvider', () => {
  const createProvider = (config: Record<string, string>) => {
    const configService = {
      get: jest.fn((key: string) => config[key]),
    } as unknown as ConfigService;

    return new SendGridProvider(configService);
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns mock response when not configured', async () => {
    const provider = createProvider({});

    const result = await provider.sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      text: 'Hello',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toMatch(/^mock_/);
  });

  it('sends email when configured', async () => {
    const provider = createProvider({
      SENDGRID_API_KEY: 'key',
      SENDGRID_FROM_EMAIL: 'from@example.com',
      SENDGRID_FROM_NAME: 'Sender',
    });

    const headers = new Map([['x-message-id', 'msg-1']]);
    const fetchMock = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      headers: { get: (name: string) => headers.get(name) },
    } as any);

    const result = await provider.sendEmail({
      to: 'a@b.com',
      subject: 'Test',
      text: 'Hello',
      html: '<p>Hi</p>',
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(result).toEqual({ success: true, messageId: 'msg-1' });
  });

  it('returns error when sendgrid responds with failure', async () => {
    const provider = createProvider({ SENDGRID_API_KEY: 'key' });

    jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue('bad request'),
    } as any);

    const result = await provider.sendEmail({
      to: 'a@b.com',
      subject: 'Test',
    });

    expect(result).toEqual({ success: false, error: 'bad request' });
  });

  it('returns error when fetch throws', async () => {
    const provider = createProvider({ SENDGRID_API_KEY: 'key' });

    jest.spyOn(global, 'fetch' as any).mockRejectedValue(new Error('network'));

    const result = await provider.sendEmail({
      to: 'a@b.com',
      subject: 'Test',
    });

    expect(result).toEqual({ success: false, error: 'network' });
  });

  it('exposes defaults and readiness', () => {
    const provider = createProvider({
      SENDGRID_API_KEY: 'key',
      SENDGRID_FROM_EMAIL: 'from@example.com',
      SENDGRID_FROM_NAME: 'Sender',
    });

    expect(provider.getDefaultFromEmail()).toBe('from@example.com');
    expect(provider.getDefaultFromName()).toBe('Sender');
    expect(provider.isReady()).toBe(true);
  });
});
