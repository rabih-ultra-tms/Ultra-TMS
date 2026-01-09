import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean, IsInt, IsArray, IsObject, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Document Types
export enum DocumentType {
  BOL = 'BOL',
  POD = 'POD',
  RATE_CONFIRM = 'RATE_CONFIRM',
  INVOICE = 'INVOICE',
  INSURANCE = 'INSURANCE',
  CONTRACT = 'CONTRACT',
  W9 = 'W9',
  CARRIER_AGREEMENT = 'CARRIER_AGREEMENT',
  QUOTE = 'QUOTE',
  STATEMENT = 'STATEMENT',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
}

export enum EntityType {
  LOAD = 'LOAD',
  ORDER = 'ORDER',
  CARRIER = 'CARRIER',
  COMPANY = 'COMPANY',
  USER = 'USER',
}

export enum StorageProvider {
  S3 = 'S3',
  MINIO = 'MINIO',
  LOCAL = 'LOCAL',
}

// ============================================
// Document DTOs
// ============================================

export class CreateDocumentDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsUUID()
  loadId?: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Date)
  retentionDate?: Date;
}

export class DocumentQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsUUID()
  loadId?: string;

  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeArchived?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class BulkDocumentDeleteDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  documentIds!: string[];
}

// ============================================
// Template DTOs
// ============================================

export enum TemplateType {
  RATE_CONFIRM = 'RATE_CONFIRM',
  BOL = 'BOL',
  INVOICE = 'INVOICE',
  CARRIER_PACKET = 'CARRIER_PACKET',
  QUOTE = 'QUOTE',
  STATEMENT = 'STATEMENT',
}

export enum TemplateFormat {
  HTML = 'HTML',
  PDF = 'PDF',
  DOCX = 'DOCX',
}

export enum PaperSize {
  LETTER = 'LETTER',
  A4 = 'A4',
  LEGAL = 'LEGAL',
}

export enum Orientation {
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE',
}

export class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TemplateType)
  templateType!: TemplateType;

  @IsEnum(TemplateFormat)
  templateFormat!: TemplateFormat;

  @IsOptional()
  @IsString()
  templateContent?: string;

  @IsOptional()
  @IsEnum(PaperSize)
  paperSize?: PaperSize;

  @IsOptional()
  @IsEnum(Orientation)
  orientation?: Orientation;

  @IsOptional()
  @IsObject()
  margins?: { top: number; bottom: number; left: number; right: number };

  @IsOptional()
  @IsBoolean()
  includeLogo?: boolean;

  @IsOptional()
  @IsString()
  headerContent?: string;

  @IsOptional()
  @IsString()
  footerContent?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  language?: string;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TemplateType)
  templateType?: TemplateType;

  @IsOptional()
  @IsEnum(TemplateFormat)
  templateFormat?: TemplateFormat;

  @IsOptional()
  @IsString()
  templateContent?: string;

  @IsOptional()
  @IsEnum(PaperSize)
  paperSize?: PaperSize;

  @IsOptional()
  @IsEnum(Orientation)
  orientation?: Orientation;

  @IsOptional()
  @IsObject()
  margins?: { top: number; bottom: number; left: number; right: number };

  @IsOptional()
  @IsBoolean()
  includeLogo?: boolean;

  @IsOptional()
  @IsString()
  headerContent?: string;

  @IsOptional()
  @IsString()
  footerContent?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TemplateQueryDto {
  @IsOptional()
  @IsEnum(TemplateType)
  templateType?: TemplateType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeInactive?: boolean;
}

export class GenerateDocumentDto {
  @IsUUID()
  templateId!: string;

  @IsEnum(EntityType)
  entityType!: EntityType;

  @IsString()
  entityId!: string;

  @IsOptional()
  @IsObject()
  additionalData?: Record<string, unknown>;
}

// ============================================
// Folder DTOs
// ============================================

export class CreateFolderDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  parentFolderId?: string;

  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @IsOptional()
  @IsString()
  entityId?: string;
}

export class UpdateFolderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  parentFolderId?: string;
}

export class AddDocumentToFolderDto {
  @IsUUID()
  documentId!: string;
}

// ============================================
// Share DTOs
// ============================================

export enum ShareType {
  LINK = 'LINK',
  EMAIL = 'EMAIL',
  PORTAL = 'PORTAL',
}

export class CreateShareDto {
  @IsEnum(ShareType)
  shareType!: ShareType;

  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxViews?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxDownloads?: number;

  @IsOptional()
  @IsBoolean()
  allowDownload?: boolean;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  recipientName?: string;
}
