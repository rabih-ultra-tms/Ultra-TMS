import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class PayClaimDto {
  @ApiProperty({ minimum: 0, description: 'Payment amount applied to the claim.' })
  @IsNumber()
  @Min(0)
  amount!: number;
}
