import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { RateType } from '@prisma/client';

export class CreateRateLaneDto {
  @IsString()
  originCity!: string;

  @IsString()
  originState!: string;

  @IsOptional()
  @IsString()
  originZip?: string;

  @IsString()
  destCity!: string;

  @IsString()
  destState!: string;

  @IsOptional()
  @IsString()
  destZip?: string;

  @IsString()
  equipmentType!: string;

  @IsEnum(RateType)
  rateType!: RateType;

  @IsNumber()
  @Min(0)
  rateAmount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  fuelSurchargeTableId?: string;
}
