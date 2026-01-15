import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class RecoverSubrogationDto {
  @ApiProperty({ minimum: 0, description: 'Amount recovered in the subrogation.' })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ description: 'Settlement date in ISO 8601 format.' })
  @IsOptional()
  @IsDateString()
  settlementDate?: string;

  @ApiPropertyOptional({ minimum: 0, description: 'Settlement amount.' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  settlementAmount?: number;
}
