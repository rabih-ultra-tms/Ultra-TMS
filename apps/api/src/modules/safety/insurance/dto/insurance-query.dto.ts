import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class InsuranceQueryDto {
  @ApiPropertyOptional({ description: 'Carrier ID' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ description: 'Expired flag' })
  @IsOptional()
  @IsBoolean()
  isExpired?: boolean;

  @ApiPropertyOptional({ description: 'Verified flag' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
