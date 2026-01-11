import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SubmitBidDto {
  @IsNumber()
  @Min(0)
  bidAmount!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  equipmentId?: string;
}