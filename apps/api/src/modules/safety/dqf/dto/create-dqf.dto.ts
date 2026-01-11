import { DQFDocumentType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateDqfDto {
  @IsString()
  driverId: string;

  @IsEnum(DQFDocumentType)
  documentType: DQFDocumentType;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  issueDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expirationDate?: Date;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  clearinghouseStatus?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastQueryDate?: Date;
}
