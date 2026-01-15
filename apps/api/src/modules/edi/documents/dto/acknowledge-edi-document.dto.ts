import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EdiAckStatus } from '../../dto/enums';

export class AcknowledgeEdiDocumentDto {
  @ApiProperty({ description: 'Acknowledgement control number.' })
  @IsString()
  ackControlNumber: string;

  @ApiProperty({ enum: EdiAckStatus, description: 'Acknowledgement status.' })
  @IsEnum(EdiAckStatus)
  ackStatus: EdiAckStatus;

  @ApiPropertyOptional({ type: 'object', description: 'Optional error codes/details from acknowledgement.' })
  @IsOptional()
  errorCodes?: Record<string, unknown>;
}
