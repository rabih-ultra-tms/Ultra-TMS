import { IsOptional, IsString } from 'class-validator';

export class QualifyLeadDto {
  @IsOptional()
  @IsString()
  qualificationNotes?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}