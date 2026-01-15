import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatusEnum } from '../../dto/enums';

export class VerificationQueryDto {
  @ApiPropertyOptional({ enum: VerificationStatusEnum })
  @IsOptional()
  @IsEnum(VerificationStatusEnum)
  verificationStatus?: VerificationStatusEnum;

  @ApiPropertyOptional({ description: 'NOA record ID' })
  @IsOptional()
  @IsString()
  noaRecordId?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
