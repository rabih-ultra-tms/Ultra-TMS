import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    this.fromName = this.configService.get<string>('SENDGRID_FROM_NAME', 'Ultra-TMS');

    if (apiKey && apiKey !== 'your_sendgrid_api_key_here') {
      sgMail.setApiKey(apiKey);
      this.logger.log('SendGrid email service initialized');
    } else {
      this.logger.warn('SendGrid API key not configured - emails will be logged only');
    }
  }

  /**
   * Send user invitation email
   */
  async sendInvitation(
    email: string,
    firstName: string,
    invitationToken: string,
    inviterName: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get('APP_URL', 'http://localhost:3000')}/auth/accept-invitation?token=${invitationToken}`;

    const msg = {
      to: email,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject: 'You\'re invited to join Ultra-TMS',
      text: `Hi ${firstName},\n\n${inviterName} has invited you to join their Ultra-TMS organization.\n\nClick the link below to set up your account:\n${resetUrl}\n\nThis invitation will expire in 72 hours.\n\nBest regards,\nThe Ultra-TMS Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Ultra-TMS!</h2>
          <p>Hi ${firstName},</p>
          <p>${inviterName} has invited you to join their Ultra-TMS organization.</p>
          <p>
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Accept Invitation
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This invitation will expire in 72 hours.</p>
          <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #999; font-size: 12px;">Ultra-TMS - Transportation Management System</p>
        </div>
      `,
    };

    await this.sendEmail(msg);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get('APP_URL', 'http://localhost:3000')}/auth/reset-password?token=${resetToken}`;

    const msg = {
      to: email,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject: 'Reset your Ultra-TMS password',
      text: `Hi ${firstName},\n\nWe received a request to reset your password.\n\nClick the link below to set a new password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Ultra-TMS Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Hi ${firstName},</p>
          <p>We received a request to reset your password.</p>
          <p>
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #999; font-size: 12px;">Ultra-TMS - Transportation Management System</p>
        </div>
      `,
    };

    await this.sendEmail(msg);
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    email: string,
    firstName: string,
    verificationToken: string,
  ): Promise<void> {
    const verifyUrl = `${this.configService.get('APP_URL', 'http://localhost:3000')}/auth/verify-email?token=${verificationToken}`;

    const msg = {
      to: email,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject: 'Verify your email address',
      text: `Hi ${firstName},\n\nPlease verify your email address by clicking the link below:\n${verifyUrl}\n\nBest regards,\nThe Ultra-TMS Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Hi ${firstName},</p>
          <p>Please verify your email address to complete your account setup.</p>
          <p>
            <a href="${verifyUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Verify Email
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #999; font-size: 12px;">Ultra-TMS - Transportation Management System</p>
        </div>
      `,
    };

    await this.sendEmail(msg);
  }

  /**
   * Send MFA code (stub - MFA disabled in Phase A)
   */
  async sendMfaCode(email: string, firstName: string, code: string): Promise<void> {
    const mfaEnabled = this.configService.get<string>('MFA_ENABLED') === 'true';

    if (!mfaEnabled) {
      this.logger.debug(`MFA is disabled - would have sent code ${code} to ${email}`);
      return;
    }

    const msg = {
      to: email,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject: 'Your Ultra-TMS verification code',
      text: `Hi ${firstName},\n\nYour verification code is: ${code}\n\nThis code will expire in 5 minutes.\n\nBest regards,\nThe Ultra-TMS Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Verification Code</h2>
          <p>Hi ${firstName},</p>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #999; font-size: 12px;">Ultra-TMS - Transportation Management System</p>
        </div>
      `,
    };

    await this.sendEmail(msg);
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const msg = {
      to: email,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject: 'Welcome to Ultra-TMS!',
      text: `Hi ${firstName},\n\nWelcome to Ultra-TMS! Your account has been successfully created.\n\nYou can now log in and start managing your transportation operations.\n\nBest regards,\nThe Ultra-TMS Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Ultra-TMS!</h2>
          <p>Hi ${firstName},</p>
          <p>Your account has been successfully created. You can now log in and start managing your transportation operations.</p>
          <p>
            <a href="${this.configService.get('APP_URL', 'http://localhost:3000')}/login" 
               style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Go to Dashboard
            </a>
          </p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #999; font-size: 12px;">Ultra-TMS - Transportation Management System</p>
        </div>
      `,
    };

    await this.sendEmail(msg);
  }

  /**
   * Internal method to send emails with fallback to console logging
   */
  private async sendEmail(msg: sgMail.MailDataRequired): Promise<void> {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');

    if (!apiKey || apiKey === 'your_sendgrid_api_key_here') {
      // In development without SendGrid configured, log to console
      this.logger.log('📧 Email (would be sent in production):');
      this.logger.log(`   To: ${msg.to}`);
      this.logger.log(`   Subject: ${msg.subject}`);
      this.logger.log(`   Text: ${msg.text}`);
      return;
    }

    try {
      await sgMail.send(msg);
      this.logger.log(`✅ Email sent to ${msg.to}: ${msg.subject}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${msg.to}:`, error);
      throw new Error('Failed to send email');
    }
  }
}
