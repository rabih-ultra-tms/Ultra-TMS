import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateRateTableDto {
  @IsString()
  tableName: string;

  @IsDateString()
  effectiveDate: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
