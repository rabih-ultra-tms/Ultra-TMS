import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateClaimAdjustmentDto {
  @IsString()
  @IsNotEmpty()
  adjustmentType!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}
