import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { VerificationStatusEnum } from '../../dto/enums';

export class RespondToVerificationDto {
  @IsEnum(VerificationStatusEnum)
  verificationStatus: VerificationStatusEnum;

  @IsOptional()
  @IsString()
  verificationDocumentId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  nextVerificationDate?: string;
}
