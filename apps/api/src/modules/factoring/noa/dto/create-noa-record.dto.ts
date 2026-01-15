import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoaRecordDto {
  @ApiProperty({ description: 'Carrier ID' })
  @IsString()
  carrierId: string;

  @ApiProperty({ description: 'Factoring company ID' })
  @IsString()
  factoringCompanyId: string;

  @ApiPropertyOptional({ description: 'NOA number' })
  @IsOptional()
  @IsString()
  noaNumber?: string;

  @ApiPropertyOptional({ description: 'NOA document URL' })
  @IsOptional()
  @IsString()
  noaDocument?: string;

  @ApiProperty({ description: 'Received date', format: 'date-time', type: String })
  @IsDateString()
  receivedDate: string;

  @ApiProperty({ description: 'Effective date', format: 'date-time', type: String })
  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional({ description: 'Expiration date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}
