import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CalculateFuelSurchargeDto {
  @IsString()
  fuelTableId: string;

  @IsNumber()
  currentFuelPrice: number;

  @IsNumber()
  @Min(0)
  lineHaulAmount: number;

  @IsOptional()
  @IsNumber()
  miles?: number;
}
