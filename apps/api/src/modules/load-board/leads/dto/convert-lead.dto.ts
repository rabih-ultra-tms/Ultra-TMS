import { IsOptional, IsString } from 'class-validator';

export class ConvertLeadDto {
  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
