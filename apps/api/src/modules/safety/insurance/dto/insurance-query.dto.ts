import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class InsuranceQueryDto {
  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsBoolean()
  isExpired?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
