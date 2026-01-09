import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  MaxLength,
  Matches,
} from 'class-validator';

export class SendSmsDto {
  // Template-based sending
  @IsOptional()
  @IsString()
  templateCode?: string;

  // OR custom message
  @IsOptional()
  @IsString()
  @MaxLength(1600) // SMS segment limit consideration
  message?: string;

  // Recipient phone (E.164 format preferred)
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in valid format (E.164 recommended)',
  })
  phoneNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  recipientName?: string;

  @IsOptional()
  @IsString()
  recipientType?: string; // CARRIER, DRIVER, CONTACT

  @IsOptional()
  @IsString()
  recipientId?: string;

  // Entity association
  @IsOptional()
  @IsString()
  entityType?: string; // LOAD, ORDER, CARRIER

  @IsOptional()
  @IsString()
  entityId?: string;

  // Link to load for conversation threading
  @IsOptional()
  @IsString()
  loadId?: string;

  // Template variables
  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;

  // Media URLs (MMS)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}

export class ReplySmsDto {
  @IsString()
  @MaxLength(1600)
  message!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}
