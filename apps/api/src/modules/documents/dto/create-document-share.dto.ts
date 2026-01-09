import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateDocumentShareDto {
  @IsString()
  documentId!: string;

  @IsString()
  shareType!: string; // LINK, EMAIL, PORTAL

  @IsOptional()
  @IsString()
  accessPassword?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  maxViews?: number;

  @IsOptional()
  @IsNumber()
  maxDownloads?: number;

  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  recipientName?: string;
}

export class UpdateDocumentShareDto {
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
