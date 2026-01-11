import { IsNumber, Min } from 'class-validator';

export class PayClaimDto {
  @IsNumber()
  @Min(0)
  amount!: number;
}
