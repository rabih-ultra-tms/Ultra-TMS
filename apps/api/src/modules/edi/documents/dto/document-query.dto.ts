import { EdiDirection, EdiMessageStatus, EdiTransactionType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class DocumentQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(EdiTransactionType)
  transactionType?: EdiTransactionType;

  @IsOptional()
  @IsEnum(EdiDirection)
  direction?: EdiDirection;

  @IsOptional()
  @IsEnum(EdiMessageStatus)
  status?: EdiMessageStatus;

  @IsOptional()
  @IsString()
  tradingPartnerId?: string;

  @IsOptional()
  @IsString()
  entityId?: string;
}
