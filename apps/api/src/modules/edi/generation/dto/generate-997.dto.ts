import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { IsEnum } from 'class-validator';
import { EdiAckStatus } from '../../dto/enums';

export class Generate997Dto {
  @IsString()
  tradingPartnerId: string;

  @IsString()
  originalMessageId: string;

  @IsEnum(EdiAckStatus)
  ackStatus: EdiAckStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
