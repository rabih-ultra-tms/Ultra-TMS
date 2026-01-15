import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { EdiAckStatus } from '../../dto/enums';

export class Generate997Dto {
  @ApiProperty({ description: 'Trading partner identifier.' })
  @IsString()
  tradingPartnerId: string;

  @ApiProperty({ description: 'Original EDI message identifier.' })
  @IsString()
  originalMessageId: string;

  @ApiProperty({ enum: EdiAckStatus, description: 'Acknowledgement status.' })
  @IsEnum(EdiAckStatus)
  ackStatus: EdiAckStatus;

  @ApiPropertyOptional({ description: 'Optional notes for the acknowledgement.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Send the EDI message immediately after generation.' })
  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
