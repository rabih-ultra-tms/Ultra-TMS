import { ApiPropertyOptional } from '@nestjs/swagger';
import { EdiDirection, EdiMessageStatus, EdiTransactionType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class DocumentQueryDto {
  @ApiPropertyOptional({ minimum: 1, description: 'Results page number.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, description: 'Maximum results per page.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: EdiTransactionType, description: 'Filter by transaction type.' })
  @IsOptional()
  @IsEnum(EdiTransactionType)
  transactionType?: EdiTransactionType;

  @ApiPropertyOptional({ enum: EdiDirection, description: 'Filter by document direction.' })
  @IsOptional()
  @IsEnum(EdiDirection)
  direction?: EdiDirection;

  @ApiPropertyOptional({ enum: EdiMessageStatus, description: 'Filter by message status.' })
  @IsOptional()
  @IsEnum(EdiMessageStatus)
  status?: EdiMessageStatus;

  @ApiPropertyOptional({ description: 'Filter by trading partner identifier.' })
  @IsOptional()
  @IsString()
  tradingPartnerId?: string;

  @ApiPropertyOptional({ description: 'Filter by linked entity identifier.' })
  @IsOptional()
  @IsString()
  entityId?: string;
}
