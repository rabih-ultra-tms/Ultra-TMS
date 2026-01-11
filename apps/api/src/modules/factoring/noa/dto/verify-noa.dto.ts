import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VerificationMethodEnum } from '../../dto/enums';

export class VerifyNoaDto {
  @IsEnum(VerificationMethodEnum)
  verificationMethod: VerificationMethodEnum;

  @IsOptional()
  @IsString()
  verificationNotes?: string;
}
