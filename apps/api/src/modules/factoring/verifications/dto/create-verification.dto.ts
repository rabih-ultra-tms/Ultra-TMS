import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationMethodEnum, VerificationStatusEnum } from '../../dto/enums';

export class CreateFactoringVerificationDto {
  @ApiProperty({ description: 'NOA record ID' })
  @IsString()
  noaRecordId: string;

  @ApiProperty({ description: 'Verification date', format: 'date-time', type: String })
  @IsDateString()
  verificationDate: string;

  @ApiProperty({ enum: VerificationMethodEnum })
  @IsEnum(VerificationMethodEnum)
  verificationMethod: VerificationMethodEnum;

  @ApiPropertyOptional({ description: 'Contacted person' })
  @IsOptional()
  @IsString()
  contactedPerson?: string;

  @ApiPropertyOptional({ enum: VerificationStatusEnum })
  @IsOptional()
  @IsEnum(VerificationStatusEnum)
  verificationStatus?: VerificationStatusEnum;

  @ApiPropertyOptional({ description: 'Verification document ID' })
  @IsOptional()
  @IsString()
  verificationDocumentId?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Next verification date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  nextVerificationDate?: string;

  @ApiPropertyOptional({ description: 'Load ID' })
  @IsOptional()
  @IsString()
  loadId?: string;
}
