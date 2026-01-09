import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
  IsEmail,
} from 'class-validator';

export enum TemplateChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum TemplateCategory {
  LOAD = 'LOAD',
  CARRIER = 'CARRIER',
  CUSTOMER = 'CUSTOMER',
  SYSTEM = 'SYSTEM',
  ACCOUNTING = 'ACCOUNTING',
  DOCUMENTS = 'DOCUMENTS',
}

export class CreateTemplateDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(100)
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TemplateCategory)
  category?: TemplateCategory;

  @IsEnum(TemplateChannel)
  channel!: TemplateChannel;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  subjectEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  subjectEs?: string;

  @IsString()
  bodyEn!: string;

  @IsOptional()
  @IsString()
  bodyEs?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fromName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  fromEmail?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  replyTo?: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
