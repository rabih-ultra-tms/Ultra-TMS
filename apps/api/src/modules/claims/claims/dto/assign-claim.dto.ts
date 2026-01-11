import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignClaimDto {
  @IsString()
  @IsNotEmpty()
  assignedToId!: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
