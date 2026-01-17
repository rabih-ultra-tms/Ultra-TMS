import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe('EmailService', () => {
  let configService: { get: jest.Mock };

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'SENDGRID_API_KEY') return 'your_sendgrid_api_key_here';
        if (key === 'SENDGRID_FROM_EMAIL') return 'noreply@test.local';
        if (key === 'SENDGRID_FROM_NAME') return 'Ultra-TMS';
        if (key === 'APP_URL') return 'http://localhost:3000';
        if (key === 'MFA_ENABLED') return 'false';
        return defaultValue;
      }),
    };
  });

  it('sends invitation email payload', async () => {
    const service = new EmailService(configService as unknown as ConfigService);
    const spy = jest.spyOn(service as any, 'sendEmail').mockResolvedValue(undefined);

    await service.sendInvitation('a@b.com', 'A', 'token', 'Inviter');

    expect(spy).toHaveBeenCalled();
  });

  it('sends password reset email payload', async () => {
    const service = new EmailService(configService as unknown as ConfigService);
    const spy = jest.spyOn(service as any, 'sendEmail').mockResolvedValue(undefined);

    await service.sendPasswordReset('a@b.com', 'A', 'token');

    expect(spy).toHaveBeenCalled();
  });

  it('sends verification email payload', async () => {
    const service = new EmailService(configService as unknown as ConfigService);
    const spy = jest.spyOn(service as any, 'sendEmail').mockResolvedValue(undefined);

    await service.sendEmailVerification('a@b.com', 'A', 'token');

    expect(spy).toHaveBeenCalled();
  });

  it('skips MFA when disabled', async () => {
    const service = new EmailService(configService as unknown as ConfigService);
    const spy = jest.spyOn(service as any, 'sendEmail').mockResolvedValue(undefined);

    await service.sendMfaCode('a@b.com', 'A', '123456');

    expect(spy).not.toHaveBeenCalled();
  });

  it('sends MFA when enabled', async () => {
    configService.get.mockImplementation((key: string, defaultValue?: string) => {
      if (key === 'SENDGRID_API_KEY') return 'real_key';
      if (key === 'SENDGRID_FROM_EMAIL') return 'noreply@test.local';
      if (key === 'SENDGRID_FROM_NAME') return 'Ultra-TMS';
      if (key === 'APP_URL') return 'http://localhost:3000';
      if (key === 'MFA_ENABLED') return 'true';
      return defaultValue;
    });

    const service = new EmailService(configService as unknown as ConfigService);
    const spy = jest.spyOn(service as any, 'sendEmail').mockResolvedValue(undefined);

    await service.sendMfaCode('a@b.com', 'A', '123456');

    expect(spy).toHaveBeenCalled();
  });

  it('sends welcome email', async () => {
    const service = new EmailService(configService as unknown as ConfigService);
    const spy = jest.spyOn(service as any, 'sendEmail').mockResolvedValue(undefined);

    await service.sendWelcomeEmail('a@b.com', 'A');

    expect(spy).toHaveBeenCalled();
  });

  it('does not call sendgrid when api key is placeholder', async () => {
    const service = new EmailService(configService as unknown as ConfigService);
    const msg = { to: 'a@b.com', from: { email: 'noreply@test.local', name: 'Ultra-TMS' }, subject: 'Test', text: 'Hi' } as any;

    await (service as any).sendEmail(msg);

    expect(sgMail.send).not.toHaveBeenCalled();
  });

  it('throws when sendgrid send fails', async () => {
    configService.get.mockImplementation((key: string, defaultValue?: string) => {
      if (key === 'SENDGRID_API_KEY') return 'real_key';
      if (key === 'SENDGRID_FROM_EMAIL') return 'noreply@test.local';
      if (key === 'SENDGRID_FROM_NAME') return 'Ultra-TMS';
      return defaultValue;
    });

    const service = new EmailService(configService as unknown as ConfigService);
    (sgMail.send as jest.Mock).mockRejectedValue(new Error('fail'));
    const msg = { to: 'a@b.com', from: { email: 'noreply@test.local', name: 'Ultra-TMS' }, subject: 'Test', text: 'Hi' } as any;

    await expect((service as any).sendEmail(msg)).rejects.toThrow('Failed to send email');
  });
});
