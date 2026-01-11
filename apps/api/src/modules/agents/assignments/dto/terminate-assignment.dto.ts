import { IsOptional, IsString } from 'class-validator';

export class TerminateAssignmentDto {
  @IsOptional()
  @IsString()
  reason?: string;
}