import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UpdatePreferencesDto } from './dto';

const DEFAULT_PREFERENCES = {
  // Notification types
  loadAssigned: true,
  loadStatusChange: true,
  documentReceived: true,
  invoiceCreated: true,
  paymentReceived: true,
  claimFiled: true,
  carrierExpiring: true,

  // Channels
  emailEnabled: true,
  smsEnabled: false,
  pushEnabled: true,
  inAppEnabled: true,

  // Quiet hours
  quietHoursEnabled: false,
  quietHoursStart: null,
  quietHoursEnd: null,
  quietHoursTimezone: null,
};

@Injectable()
export class PreferencesService {
  private readonly logger = new Logger(PreferencesService.name);

  constructor(private prisma: PrismaService) {}

  async get(tenantId: string, userId: string) {
    let preferences = await this.prisma.notificationPreference.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await this.prisma.notificationPreference.create({
        data: {
          tenantId,
          userId,
          ...DEFAULT_PREFERENCES,
        },
      });
      this.logger.log(`Created default preferences for user ${userId}`);
    }

    return preferences;
  }

  async update(tenantId: string, userId: string, dto: UpdatePreferencesDto) {
    // Ensure preferences exist
    await this.get(tenantId, userId);

    const preferences = await this.prisma.notificationPreference.update({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
      data: {
        loadAssigned: dto.loadAssigned,
        loadStatusChange: dto.loadStatusChange,
        documentReceived: dto.documentReceived,
        invoiceCreated: dto.invoiceCreated,
        paymentReceived: dto.paymentReceived,
        claimFiled: dto.claimFiled,
        carrierExpiring: dto.carrierExpiring,
        emailEnabled: dto.emailEnabled,
        smsEnabled: dto.smsEnabled,
        pushEnabled: dto.pushEnabled,
        inAppEnabled: dto.inAppEnabled,
        quietHoursEnabled: dto.quietHoursEnabled,
        quietHoursStart: dto.quietHoursStart,
        quietHoursEnd: dto.quietHoursEnd,
        quietHoursTimezone: dto.quietHoursTimezone,
      },
    });

    this.logger.log(`Updated preferences for user ${userId}`);
    return preferences;
  }

  async reset(tenantId: string, userId: string) {
    const preferences = await this.prisma.notificationPreference.upsert({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
      update: DEFAULT_PREFERENCES,
      create: {
        tenantId,
        userId,
        ...DEFAULT_PREFERENCES,
      },
    });

    this.logger.log(`Reset preferences to defaults for user ${userId}`);
    return preferences;
  }

  // Helper method to check if a user should receive a notification
  async shouldNotify(
    tenantId: string,
    userId: string,
    notificationType: keyof typeof DEFAULT_PREFERENCES,
    channel: 'email' | 'sms' | 'push' | 'inApp',
  ): Promise<boolean> {
    const preferences = await this.get(tenantId, userId);

    // Check if notification type is enabled
    const typeKey = notificationType as keyof typeof preferences;
    if (preferences[typeKey] === false) {
      return false;
    }

    // Check if channel is enabled
    const channelKey = `${channel}Enabled` as keyof typeof preferences;
    if (preferences[channelKey] === false) {
      return false;
    }

    // Check quiet hours
    if (preferences.quietHoursEnabled && preferences.quietHoursStart && preferences.quietHoursEnd) {
      const now = new Date();
      const timezone = preferences.quietHoursTimezone || 'America/Chicago';
      
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const currentTime = formatter.format(now);
        
        const start = preferences.quietHoursStart;
        const end = preferences.quietHoursEnd;
        
        // Simple time comparison (doesn't handle overnight quiet hours perfectly)
        if (currentTime >= start && currentTime <= end) {
          return false;
        }
      } catch (error) {
        // If timezone is invalid, allow notification
        this.logger.warn(`Invalid timezone for user ${userId}: ${timezone}`);
      }
    }

    return true;
  }

  // Get all users who should receive a notification for a given event
  async getUsersForNotification(
    tenantId: string,
    notificationType: string,
    channel: 'email' | 'sms' | 'push' | 'inApp',
  ): Promise<string[]> {
    const typeColumn = notificationType as string;
    const channelColumn = `${channel}Enabled`;

    const preferences = await this.prisma.notificationPreference.findMany({
      where: {
        tenantId,
        [typeColumn]: true,
        [channelColumn]: true,
      },
      select: { userId: true },
    });

    return preferences.map((p) => p.userId);
  }
}
