import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { SubrogationStatus } from '@prisma/client';

export class CreateSubrogationDto {
  @ApiProperty({ description: 'Target party for subrogation.' })
  @IsString()
  @IsNotEmpty()
  targetParty!: string;

  @ApiProperty({ description: 'Target party type (e.g., carrier, broker).' })
  @IsString()
  @IsNotEmpty()
  targetPartyType!: string;

  @ApiProperty({ minimum: 0, description: 'Amount sought for subrogation.' })
  @IsNumber()
  @Min(0)
  amountSought!: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Amount recovered to date.' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountRecovered?: number;

  @ApiPropertyOptional({ enum: SubrogationStatus, description: 'Subrogation case status.' })
  @IsOptional()
  @IsEnum(SubrogationStatus)
  status?: SubrogationStatus;

  @ApiPropertyOptional({ description: 'Attorney name associated with the case.' })
  @IsOptional()
  @IsString()
  attorneyName?: string;

  @ApiPropertyOptional({ description: 'Attorney firm name.' })
  @IsOptional()
  @IsString()
  attorneyFirm?: string;

  @ApiPropertyOptional({ description: 'Case number reference.' })
  @IsOptional()
  @IsString()
  caseNumber?: string;

  @ApiPropertyOptional({ description: 'Filing date in ISO 8601 format.' })
  @IsOptional()
  @IsDateString()
  filingDate?: string;

  @ApiPropertyOptional({ description: 'Settlement date in ISO 8601 format.' })
  @IsOptional()
  @IsDateString()
  settlementDate?: string;

  @ApiPropertyOptional({ minimum: 0, description: 'Settlement amount.' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  settlementAmount?: number;

  @ApiPropertyOptional({ description: 'Closed date in ISO 8601 format.' })
  @IsOptional()
  @IsDateString()
  closedDate?: string;

  @ApiPropertyOptional({ description: 'Reason for case closure.' })
  @IsOptional()
  @IsString()
  closureReason?: string;
}
