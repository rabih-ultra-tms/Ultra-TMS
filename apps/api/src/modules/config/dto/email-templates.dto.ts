import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateEmailTemplateDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  subjectEs?: string;

  @IsOptional()
  @IsString()
  bodyEs?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;

  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
