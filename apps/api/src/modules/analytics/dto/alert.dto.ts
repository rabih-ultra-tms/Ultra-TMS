import { IsOptional, IsString } from 'class-validator';

export class AcknowledgeAlertDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ResolveAlertDto {
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
