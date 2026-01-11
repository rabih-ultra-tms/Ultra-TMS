import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateVolumeCommitmentDto {
  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minimumLoads?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumRevenue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumWeight?: number;

  @IsOptional()
  @IsNumber()
  shortfallFee?: number;

  @IsOptional()
  @IsNumber()
  shortfallPercent?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
