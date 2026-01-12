import { IsOptional, IsString } from 'class-validator';

export class QualifyLeadDto {
  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
