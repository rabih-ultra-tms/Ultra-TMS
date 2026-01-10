import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateCheckCallDto {
  @IsDateString()
  timestamp!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsDateString()
  eta?: string;
}
