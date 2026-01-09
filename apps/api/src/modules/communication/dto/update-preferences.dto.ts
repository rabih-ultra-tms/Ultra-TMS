import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdatePreferencesDto {
  // Notification types
  @IsOptional()
  @IsBoolean()
  loadAssigned?: boolean;

  @IsOptional()
  @IsBoolean()
  loadStatusChange?: boolean;

  @IsOptional()
  @IsBoolean()
  documentReceived?: boolean;

  @IsOptional()
  @IsBoolean()
  invoiceCreated?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentReceived?: boolean;

  @IsOptional()
  @IsBoolean()
  claimFiled?: boolean;

  @IsOptional()
  @IsBoolean()
  carrierExpiring?: boolean;

  // Channels
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  // Quiet hours
  @IsOptional()
  @IsBoolean()
  quietHoursEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'quietHoursStart must be in HH:MM format',
  })
  quietHoursStart?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'quietHoursEnd must be in HH:MM format',
  })
  quietHoursEnd?: string;

  @IsOptional()
  @IsString()
  quietHoursTimezone?: string;
}
