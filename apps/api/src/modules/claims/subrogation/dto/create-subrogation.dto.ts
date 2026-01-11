import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SubrogationStatus } from '@prisma/client';

export class CreateSubrogationDto {
  @IsString()
  @IsNotEmpty()
  targetParty!: string;

  @IsString()
  @IsNotEmpty()
  targetPartyType!: string;

  @IsNumber()
  @Min(0)
  amountSought!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountRecovered?: number;

  @IsOptional()
  @IsEnum(SubrogationStatus)
  status?: SubrogationStatus;

  @IsOptional()
  @IsString()
  attorneyName?: string;

  @IsOptional()
  @IsString()
  attorneyFirm?: string;

  @IsOptional()
  @IsString()
  caseNumber?: string;

  @IsOptional()
  @IsDateString()
  filingDate?: string;

  @IsOptional()
  @IsDateString()
  settlementDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  settlementAmount?: number;

  @IsOptional()
  @IsDateString()
  closedDate?: string;

  @IsOptional()
  @IsString()
  closureReason?: string;
}
