import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatusEnum } from '../../dto/enums';

export class RespondToVerificationDto {
  @ApiProperty({ enum: VerificationStatusEnum })
  @IsEnum(VerificationStatusEnum)
  verificationStatus: VerificationStatusEnum;

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
}
