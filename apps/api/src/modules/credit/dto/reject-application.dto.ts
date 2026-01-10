import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RejectCreditApplicationDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsOptional()
  @IsString()
  decisionNotes?: string;
}
