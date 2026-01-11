import { IsDateString, IsOptional, IsString } from 'class-validator';

export class OverrideFactoringDto {
  @IsString()
  factoringCompanyId: string;

  @IsOptional()
  @IsString()
  overrideReason?: string;

  @IsOptional()
  @IsDateString()
  overrideUntil?: string;
}
