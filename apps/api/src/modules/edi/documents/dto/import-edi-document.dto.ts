import { EdiDirection, EdiTransactionType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ImportEdiDocumentDto {
  @IsString()
  tradingPartnerId: string;

  @IsEnum(EdiTransactionType)
  transactionType: EdiTransactionType;

  @IsOptional()
  @IsEnum(EdiDirection)
  direction?: EdiDirection;

  @IsString()
  rawContent: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;
}
