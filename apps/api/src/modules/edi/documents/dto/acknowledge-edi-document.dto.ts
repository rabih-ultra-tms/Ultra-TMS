import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EdiAckStatus } from '../../dto/enums';

export class AcknowledgeEdiDocumentDto {
  @IsString()
  ackControlNumber: string;

  @IsEnum(EdiAckStatus)
  ackStatus: EdiAckStatus;

  @IsOptional()
  errorCodes?: Record<string, unknown>;
}
