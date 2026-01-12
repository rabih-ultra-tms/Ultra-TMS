import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class RateLookupDto {
  @IsOptional()
  @IsString()
  originCity?: string;

  @IsString()
  @Length(2, 3)
  originState!: string;

  @IsOptional()
  @IsString()
  originZip?: string;

  @IsOptional()
  @IsString()
  destCity?: string;

  @IsString()
  @Length(2, 3)
  destState!: string;

  @IsOptional()
  @IsString()
  destZip?: string;

  @IsString()
  equipmentType!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  providers?: string[]; // Specific providers or all
}
