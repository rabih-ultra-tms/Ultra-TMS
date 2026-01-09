import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
} from 'class-validator';

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

export class CreateDocumentTemplateDto {
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
  @IsString()
  templateFilePath?: string;

  @IsOptional()
  @IsString()
  paperSize?: string;

  @IsOptional()
  @IsString()
  orientation?: string;

  @IsOptional()
  @IsObject()
  margins?: Record<string, number>;

  @IsOptional()
  @IsBoolean()
  includeLogo?: boolean;

  @IsOptional()
  @IsString()
  logoPosition?: string;

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

export class UpdateDocumentTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  templateContent?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
