import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
} from 'class-validator';

export enum DocumentType {
  BOL = 'BOL',
  POD = 'POD',
  RATE_CONFIRM = 'RATE_CONFIRM',
  INVOICE = 'INVOICE',
  INSURANCE = 'INSURANCE',
  CONTRACT = 'CONTRACT',
  W9 = 'W9',
  CARRIER_AGREEMENT = 'CARRIER_AGREEMENT',
  OTHER = 'OTHER',
}

export enum EntityType {
  LOAD = 'LOAD',
  ORDER = 'ORDER',
  CARRIER = 'CARRIER',
  COMPANY = 'COMPANY',
  USER = 'USER',
}

export class CreateDocumentDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsString()
  fileName!: string;

  @IsString()
  filePath!: string;

  @IsNumber()
  fileSize!: number;

  @IsString()
  mimeType!: string;

  @IsOptional()
  @IsString()
  fileExtension?: string;

  @IsOptional()
  @IsString()
  bucketName?: string;

  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  loadId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
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
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  status?: string;
}
