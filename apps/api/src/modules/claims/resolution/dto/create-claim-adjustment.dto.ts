import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateClaimAdjustmentDto {
  @ApiProperty({ description: 'Type of adjustment applied to the claim.' })
  @IsString()
  @IsNotEmpty()
  adjustmentType!: string;

  @ApiProperty({ minimum: 0, description: 'Adjustment amount.' })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ description: 'Reason for the adjustment.' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
