import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}