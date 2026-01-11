import { IsDateString, IsOptional } from 'class-validator';

export class FileClaimDto {
  @IsOptional()
  @IsDateString()
  receivedDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
