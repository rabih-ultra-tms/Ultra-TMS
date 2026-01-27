import {
  IsString,
  IsNumber,
  IsOptional,
  IsDecimal,
  Min,
} from 'class-validator';

export class CreateServiceItemDto {
  @IsString()
  serviceTypeId: string;

  @IsString()
  name: string;

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
  @IsNumber()
  truckIndex?: number;

  @IsNumber()
  @Min(0)
  sortOrder: number = 0;
}

export class UpdateServiceItemDto extends CreateServiceItemDto {}

export class ServiceItemResponseDto {
  id: string;
  quoteId: string;
  serviceTypeId: string;
  name: string;
  rateCents: number;
  quantity: number;
  totalCents: number;
  truckIndex?: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
