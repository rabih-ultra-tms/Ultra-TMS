import {
  IsString,
  IsNumber,
  IsOptional,
  IsDecimal,
  Min,
} from 'class-validator';

export class CreateAccessorialDto {
  @IsString()
  accessorialTypeId: string;

  @IsString()
  name: string;

  @IsString()
  billingUnit: string;

  @IsNumber()
  @Min(0)
  rateCents: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  quantity?: number;

  @IsNumber()
  @Min(0)
  totalCents: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  @Min(0)
  sortOrder: number = 0;
}

export class UpdateAccessorialDto extends CreateAccessorialDto {}

export class AccessorialResponseDto {
  id: string;
  quoteId: string;
  accessorialTypeId: string;
  name: string;
  billingUnit: string;
  rateCents: number;
  quantity: number;
  totalCents: number;
  notes?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
