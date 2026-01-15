import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class Generate210Dto {
  @ApiProperty({ description: 'Trading partner identifier.' })
  @IsString()
  tradingPartnerId: string;

  @ApiProperty({ description: 'Invoice identifier to generate the 210 message.' })
  @IsString()
  invoiceId: string;

  @ApiPropertyOptional({ description: 'Send the EDI message immediately after generation.' })
  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
