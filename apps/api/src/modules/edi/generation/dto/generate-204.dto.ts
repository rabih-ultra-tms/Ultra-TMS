import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class Generate204Dto {
  @ApiProperty({ description: 'Trading partner identifier.' })
  @IsString()
  tradingPartnerId: string;

  @ApiProperty({ description: 'Load identifier to generate the 204 message.' })
  @IsString()
  loadId: string;

  @ApiPropertyOptional({ description: 'Carrier identifier for the load.' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ description: 'Send the EDI message immediately after generation.' })
  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
