import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EdiCommunicationProtocol } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { EdiPartnerType } from '../../dto/enums';

export class CreateTradingPartnerDto {
  @ApiProperty({ maxLength: 255, description: 'Trading partner name.' })
  @IsString()
  @MaxLength(255)
  partnerName: string;

  @ApiProperty({ enum: EdiPartnerType, description: 'Partner type classification.' })
  @IsEnum(EdiPartnerType)
  partnerType: EdiPartnerType;

  @ApiProperty({ maxLength: 15, description: 'ISA identifier.' })
  @IsString()
  @MaxLength(15)
  isaId: string;

  @ApiPropertyOptional({ maxLength: 15, description: 'GS identifier.' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  gsId?: string;

  @ApiPropertyOptional({ maxLength: 9, description: 'DUNS number.' })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  duns?: string;

  @ApiPropertyOptional({ maxLength: 4, description: 'SCAC code.' })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  scac?: string;

  @ApiProperty({ enum: EdiCommunicationProtocol, description: 'Communication protocol used for EDI.' })
  @IsEnum(EdiCommunicationProtocol)
  protocol: EdiCommunicationProtocol;

  @ApiPropertyOptional({ description: 'FTP host for EDI exchange.' })
  @IsOptional()
  @IsString()
  ftpHost?: string;

  @ApiPropertyOptional({ description: 'FTP port for EDI exchange.' })
  @IsOptional()
  @IsInt()
  ftpPort?: number;

  @ApiPropertyOptional({ description: 'FTP username for EDI exchange.' })
  @IsOptional()
  @IsString()
  ftpUsername?: string;

  @ApiPropertyOptional({ description: 'FTP password for EDI exchange.' })
  @IsOptional()
  @IsString()
  ftpPassword?: string;

  @ApiPropertyOptional({ description: 'FTP inbound path.' })
  @IsOptional()
  @IsString()
  ftpInboundPath?: string;

  @ApiPropertyOptional({ description: 'FTP outbound path.' })
  @IsOptional()
  @IsString()
  ftpOutboundPath?: string;

  @ApiPropertyOptional({ description: 'AS2 URL endpoint.' })
  @IsOptional()
  @IsString()
  as2Url?: string;

  @ApiPropertyOptional({ description: 'AS2 identifier.' })
  @IsOptional()
  @IsString()
  as2Identifier?: string;

  @ApiPropertyOptional({ description: 'VAN mailbox identifier.' })
  @IsOptional()
  @IsString()
  vanMailbox?: string;

  @ApiPropertyOptional({ description: 'Whether to send functional acknowledgements.' })
  @IsOptional()
  @IsBoolean()
  sendFunctionalAck?: boolean;

  @ApiPropertyOptional({ description: 'Whether functional acknowledgements are required.' })
  @IsOptional()
  @IsBoolean()
  requireFunctionalAck?: boolean;

  @ApiPropertyOptional({ description: 'Enable test mode for this trading partner.' })
  @IsOptional()
  @IsBoolean()
  testMode?: boolean;

  @ApiPropertyOptional({ type: 'object', description: 'Custom field mappings for the partner.' })
  @IsOptional()
  @IsObject()
  fieldMappings?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'External identifier for the partner.' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({ description: 'Source system reference.' })
  @IsOptional()
  @IsString()
  sourceSystem?: string;
}
