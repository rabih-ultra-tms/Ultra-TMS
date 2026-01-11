import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { VerificationMethodEnum, VerificationStatusEnum } from '../../dto/enums';

export class CreateFactoringVerificationDto {
  @IsString()
  noaRecordId: string;

  @IsDateString()
  verificationDate: string;

  @IsEnum(VerificationMethodEnum)
  verificationMethod: VerificationMethodEnum;

  @IsOptional()
  @IsString()
  contactedPerson?: string;

  @IsOptional()
  @IsEnum(VerificationStatusEnum)
  verificationStatus?: VerificationStatusEnum;

  @IsOptional()
  @IsString()
  verificationDocumentId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  nextVerificationDate?: string;

  @IsOptional()
  @IsString()
  loadId?: string;
}
