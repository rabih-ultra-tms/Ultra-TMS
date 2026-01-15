import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRateTableDto {
  @ApiProperty({ description: 'Rate table name' })
  @IsString()
  tableName!: string;

  @ApiProperty({ description: 'Effective date', format: 'date-time', type: String })
  @IsDateString()
  effectiveDate!: string;

  @ApiPropertyOptional({ description: 'Expiration date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({ description: 'Active flag' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
