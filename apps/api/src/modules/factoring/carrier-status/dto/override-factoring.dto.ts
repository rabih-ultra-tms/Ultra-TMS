import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class OverrideFactoringDto {
  @ApiProperty({ description: 'Factoring company identifier to override.' })
  @IsString()
  factoringCompanyId: string;

  @ApiPropertyOptional({ description: 'Reason for overriding factoring status.' })
  @IsOptional()
  @IsString()
  overrideReason?: string;

  @ApiPropertyOptional({ description: 'Override expiration date in ISO 8601 format.' })
  @IsOptional()
  @IsDateString()
  overrideUntil?: string;
}
