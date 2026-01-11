import { IsOptional, IsString } from 'class-validator';

export class CloseIncidentDto {
  @IsOptional()
  @IsString()
  investigationNotes?: string;

  @IsOptional()
  @IsString()
  reportUrl?: string;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
