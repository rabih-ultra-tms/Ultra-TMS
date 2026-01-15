import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentTerms } from './enums';

export class ApproveCreditApplicationDto {
  @ApiProperty({ description: 'Approved limit', minimum: 0 })
  @IsNumber()
  @Min(0)
  approvedLimit!: number;

  @ApiPropertyOptional({ enum: PaymentTerms })
  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @ApiPropertyOptional({ description: 'Decision notes' })
  @IsOptional()
  @IsString()
  decisionNotes?: string;
}
