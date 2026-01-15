import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreditHoldReason } from './enums';

export class CreateCreditHoldDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ enum: CreditHoldReason })
  @IsEnum(CreditHoldReason)
  reason!: CreditHoldReason;

  @ApiProperty({ description: 'Hold description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ description: 'Amount held', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountHeld?: number;

  @ApiPropertyOptional({ description: 'Trigger event' })
  @IsOptional()
  @IsString()
  triggerEvent?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
