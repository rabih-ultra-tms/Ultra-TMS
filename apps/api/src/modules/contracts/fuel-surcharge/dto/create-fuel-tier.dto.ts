import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreateFuelTierDto {
  @IsInt()
  tierNumber!: number;

  @IsNumber()
  priceMin!: number;

  @IsOptional()
  @IsNumber()
  priceMax?: number;

  @IsNumber()
  surchargePercent!: number;
}
