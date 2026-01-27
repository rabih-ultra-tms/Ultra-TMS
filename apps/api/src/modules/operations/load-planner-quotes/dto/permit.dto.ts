import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDecimal,
  Min,
} from 'class-validator';

export class CreatePermitDto {
  @IsString()
  stateCode: string;

  @IsString()
  stateName: string;

  @IsNumber()
  @Min(0)
  calculatedPermitFeeCents: number;

  @IsNumber()
  @Min(0)
  calculatedEscortFeeCents: number;

  @IsNumber()
  @Min(0)
  calculatedPoleCarFeeCents: number;

  @IsNumber()
  @Min(0)
  calculatedSuperLoadFeeCents: number;

  @IsNumber()
  @Min(0)
  calculatedTotalCents: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  permitFeeCents?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  escortFeeCents?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  poleCarFeeCents?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  superLoadFeeCents?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCents?: number;

  @IsDecimal({ decimal_digits: '2' })
  distanceMiles: number;

  @IsOptional()
  @IsNumber()
  escortCount?: number;

  @IsOptional()
  @IsBoolean()
  poleCarRequired?: boolean;
}

export class UpdatePermitDto extends CreatePermitDto {}

export class PermitResponseDto {
  id: string;
  quoteId: string;
  stateCode: string;
  stateName: string;
  calculatedPermitFeeCents: number;
  calculatedEscortFeeCents: number;
  calculatedPoleCarFeeCents: number;
  calculatedSuperLoadFeeCents: number;
  calculatedTotalCents: number;
  permitFeeCents?: number;
  escortFeeCents?: number;
  poleCarFeeCents?: number;
  superLoadFeeCents?: number;
  totalCents?: number;
  distanceMiles: number;
  escortCount: number;
  poleCarRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}
