import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SLAType } from '@prisma/client';

export class CreateSlaDto {
  @ApiProperty({ enum: SLAType })
  @IsEnum(SLAType)
  slaType!: SLAType;

  @ApiProperty({ description: 'Target percentage' })
  @IsNumber()
  targetPercent!: number;

  @ApiProperty({ description: 'Measurement period' })
  @IsString()
  measurementPeriod!: string;

  @ApiPropertyOptional({ description: 'Penalty amount' })
  @IsOptional()
  @IsNumber()
  penaltyAmount?: number;

  @ApiPropertyOptional({ description: 'Penalty percent' })
  @IsOptional()
  @IsNumber()
  penaltyPercent?: number;

  @ApiPropertyOptional({ description: 'SLA status' })
  @IsOptional()
  @IsString()
  status?: string;
}
