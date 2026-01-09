import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  IsDateString,
} from 'class-validator';

export enum NotificationType {
  LOAD = 'LOAD',
  CARRIER = 'CARRIER',
  INVOICE = 'INVOICE',
  DOCUMENT = 'DOCUMENT',
  CLAIM = 'CLAIM',
  SYSTEM = 'SYSTEM',
  ALERT = 'ALERT',
}

export class CreateNotificationDto {
  @IsString()
  userId!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionUrl?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class CreateBulkNotificationDto {
  @IsString({ each: true })
  userIds!: string[];

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionUrl?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
