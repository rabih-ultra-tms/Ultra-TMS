import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAmendmentDto {
  @IsDateString()
  effectiveDate!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  changedFields?: string[];

  @IsOptional()
  changes?: Record<string, unknown>;
}
