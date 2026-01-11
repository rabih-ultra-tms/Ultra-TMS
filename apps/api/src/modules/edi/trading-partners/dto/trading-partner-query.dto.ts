import { EdiCommunicationProtocol } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { EdiPartnerType } from '../../dto/enums';

export class TradingPartnerQueryDto {
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
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(EdiCommunicationProtocol)
  protocol?: EdiCommunicationProtocol;

  @IsOptional()
  @IsEnum(EdiPartnerType)
  partnerType?: EdiPartnerType;

  @IsOptional()
  @IsString()
  search?: string;
}
