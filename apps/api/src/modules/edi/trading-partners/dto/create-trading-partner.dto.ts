import { EdiCommunicationProtocol } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { EdiPartnerType } from '../../dto/enums';

export class CreateTradingPartnerDto {
  @IsString()
  @MaxLength(255)
  partnerName: string;

  @IsEnum(EdiPartnerType)
  partnerType: EdiPartnerType;

  @IsString()
  @MaxLength(15)
  isaId: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  gsId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(9)
  duns?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  scac?: string;

  @IsEnum(EdiCommunicationProtocol)
  protocol: EdiCommunicationProtocol;

  @IsOptional()
  @IsString()
  ftpHost?: string;

  @IsOptional()
  @IsInt()
  ftpPort?: number;

  @IsOptional()
  @IsString()
  ftpUsername?: string;

  @IsOptional()
  @IsString()
  ftpPassword?: string;

  @IsOptional()
  @IsString()
  ftpInboundPath?: string;

  @IsOptional()
  @IsString()
  ftpOutboundPath?: string;

  @IsOptional()
  @IsString()
  as2Url?: string;

  @IsOptional()
  @IsString()
  as2Identifier?: string;

  @IsOptional()
  @IsString()
  vanMailbox?: string;

  @IsOptional()
  @IsBoolean()
  sendFunctionalAck?: boolean;

  @IsOptional()
  @IsBoolean()
  requireFunctionalAck?: boolean;

  @IsOptional()
  @IsBoolean()
  testMode?: boolean;

  @IsOptional()
  @IsObject()
  fieldMappings?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  sourceSystem?: string;
}
