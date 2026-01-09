import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  IsObject,
  ValidateNested,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EmailAttachmentDto {
  @IsString()
  name!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class SendEmailDto {
  // Template-based sending
  @IsOptional()
  @IsString()
  templateCode?: string;

  // OR custom content
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  bodyHtml?: string;

  // Recipient
  @IsEmail()
  recipientEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  recipientName?: string;

  @IsOptional()
  @IsString()
  recipientType?: string; // USER, CARRIER, CONTACT, DRIVER

  @IsOptional()
  @IsString()
  recipientId?: string;

  // Entity association
  @IsOptional()
  @IsString()
  entityType?: string; // LOAD, ORDER, CARRIER, COMPANY

  @IsOptional()
  @IsString()
  entityId?: string;

  // Template variables
  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;

  // Language
  @IsOptional()
  @IsEnum(['en', 'es'])
  language?: 'en' | 'es';

  // Attachments
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachmentDto)
  attachments?: EmailAttachmentDto[];

  // Override from address
  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsEmail()
  fromEmail?: string;

  @IsOptional()
  @IsEmail()
  replyTo?: string;
}

export class SendBulkEmailDto {
  @IsOptional()
  @IsString()
  templateCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkEmailRecipientDto)
  recipients!: BulkEmailRecipientDto[];

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsObject()
  commonVariables?: Record<string, unknown>;
}

export class BulkEmailRecipientDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  recipientType?: string;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(['en', 'es'])
  language?: 'en' | 'es';
}
