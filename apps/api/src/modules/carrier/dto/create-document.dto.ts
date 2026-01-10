import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentStatus, DocumentType } from './enums';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCarrierDocumentDto {
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class UpdateCarrierDocumentDto extends PartialType(CreateCarrierDocumentDto) {
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
