import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { VerificationStatusEnum } from '../../dto/enums';

export class VerificationQueryDto {
  @IsOptional()
  @IsEnum(VerificationStatusEnum)
  verificationStatus?: VerificationStatusEnum;

  @IsOptional()
  @IsString()
  noaRecordId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
