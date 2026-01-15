import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class Generate214Dto {
  @ApiProperty({ description: 'Trading partner identifier.' })
  @IsString()
  tradingPartnerId: string;

  @ApiProperty({ description: 'Load identifier to generate the 214 message.' })
  @IsString()
  loadId: string;

  @ApiProperty({ description: 'EDI 214 status code.' })
  @IsString()
  statusCode: string;

  @ApiPropertyOptional({ description: 'Location code for the status update.' })
  @IsOptional()
  @IsString()
  locationCode?: string;

  @ApiPropertyOptional({ description: 'Additional notes for the status update.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Send the EDI message immediately after generation.' })
  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
