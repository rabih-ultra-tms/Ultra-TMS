import { IsOptional, IsString } from 'class-validator';

export class UpdateInvestigationDto {
  @IsOptional()
  @IsString()
  investigationNotes?: string;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsOptional()
  @IsString()
  preventionNotes?: string;
}
