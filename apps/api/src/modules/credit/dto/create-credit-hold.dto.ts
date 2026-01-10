import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CreditHoldReason } from './enums';

export class CreateCreditHoldDto {
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsEnum(CreditHoldReason)
  reason!: CreditHoldReason;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountHeld?: number;

  @IsOptional()
  @IsString()
  triggerEvent?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
