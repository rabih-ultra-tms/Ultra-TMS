import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class Generate990Dto {
  @ApiProperty({ description: 'Trading partner identifier.' })
  @IsString()
  tradingPartnerId: string;

  @ApiProperty({ description: 'Load identifier to generate the 990 message.' })
  @IsString()
  loadId: string;

  @ApiProperty({ description: 'Response code for the 990 message.' })
  @IsString()
  responseCode: string;

  @ApiPropertyOptional({ description: 'Optional notes for the response.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Send the EDI message immediately after generation.' })
  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
