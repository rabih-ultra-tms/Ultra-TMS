import { ApiPropertyOptional } from '@nestjs/swagger';
import { EdiCommunicationProtocol } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { EdiPartnerType } from '../../dto/enums';

export class TradingPartnerQueryDto {
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

  @ApiPropertyOptional({ description: 'Filter by active status.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: EdiCommunicationProtocol, description: 'Filter by communication protocol.' })
  @IsOptional()
  @IsEnum(EdiCommunicationProtocol)
  protocol?: EdiCommunicationProtocol;

  @ApiPropertyOptional({ enum: EdiPartnerType, description: 'Filter by partner type.' })
  @IsOptional()
  @IsEnum(EdiPartnerType)
  partnerType?: EdiPartnerType;

  @ApiPropertyOptional({ description: 'Search term for trading partners.' })
  @IsOptional()
  @IsString()
  search?: string;
}
