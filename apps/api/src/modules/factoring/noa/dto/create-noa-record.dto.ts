import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateNoaRecordDto {
  @IsString()
  carrierId: string;

  @IsString()
  factoringCompanyId: string;

  @IsOptional()
  @IsString()
  noaNumber?: string;

  @IsOptional()
  @IsString()
  noaDocument?: string;

  @IsDateString()
  receivedDate: string;

  @IsDateString()
  effectiveDate: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}
