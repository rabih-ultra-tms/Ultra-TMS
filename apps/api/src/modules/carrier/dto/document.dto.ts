import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';

// ============================================
// ENUMS
// ============================================
export enum DocumentType {
  W9 = 'W9',
  CARRIER_AGREEMENT = 'CARRIER_AGREEMENT',
  AUTHORITY_LETTER = 'AUTHORITY_LETTER',
  VOID_CHECK = 'VOID_CHECK',
  OTHER = 'OTHER',
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ============================================
// CREATE DOCUMENT DTO
// ============================================
export class CreateCarrierDocumentDto {
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  fileUrl!: string;

  @IsString()
  fileName!: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

// ============================================
// UPDATE DOCUMENT DTO
// ============================================
export class UpdateCarrierDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}

// ============================================
// REVIEW DOCUMENT DTO
// ============================================
export class ReviewDocumentDto {
  @IsEnum(ReviewStatus)
  reviewStatus!: ReviewStatus;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

// ============================================
// LIST QUERY DTO
// ============================================
export class DocumentListQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsEnum(ReviewStatus)
  reviewStatus?: ReviewStatus;

  @IsOptional()
  @IsBoolean()
  expiringSoon?: boolean;
}
