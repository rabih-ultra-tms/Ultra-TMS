import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationMethodEnum } from '../../dto/enums';

export class VerifyNoaDto {
  @ApiProperty({ enum: VerificationMethodEnum })
  @IsEnum(VerificationMethodEnum)
  verificationMethod: VerificationMethodEnum;

  @ApiPropertyOptional({ description: 'Verification notes' })
  @IsOptional()
  @IsString()
  verificationNotes?: string;
}
