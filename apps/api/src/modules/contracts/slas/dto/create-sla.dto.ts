import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SLAType } from '@prisma/client';

export class CreateSlaDto {
  @IsEnum(SLAType)
  slaType: SLAType;

  @IsNumber()
  targetPercent: number;

  @IsString()
  measurementPeriod: string;

  @IsOptional()
  @IsNumber()
  penaltyAmount?: number;

  @IsOptional()
  @IsNumber()
  penaltyPercent?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
