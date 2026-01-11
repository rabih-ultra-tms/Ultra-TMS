import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateClaimItemDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalValue?: number;

  @IsOptional()
  @IsString()
  damageType?: string;

  @IsOptional()
  @IsString()
  damageExtent?: string;
}
