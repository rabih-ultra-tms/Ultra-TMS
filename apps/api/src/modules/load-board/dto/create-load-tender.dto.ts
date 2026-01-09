import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TenderType {
  BROADCAST = 'BROADCAST',
  WATERFALL = 'WATERFALL',
  SPECIFIC = 'SPECIFIC',
}

export enum TenderStatus {
  ACTIVE = 'ACTIVE',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export class TenderRecipientDto {
  @IsString()
  carrierId!: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  position!: number;
}

export class CreateLoadTenderDto {
  @IsString()
  loadId!: string;

  @IsEnum(TenderType)
  tenderType!: TenderType;

  @IsNumber()
  @Type(() => Number)
  tenderRate!: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  waterfallTimeoutMinutes?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TenderRecipientDto)
  recipients!: TenderRecipientDto[];
}

export class UpdateLoadTenderDto {
  @IsOptional()
  @IsEnum(TenderStatus)
  status?: TenderStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tenderRate?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  waterfallTimeoutMinutes?: number;
}

export class RespondToTenderDto {
  @IsString()
  tenderId!: string;

  @IsString()
  carrierId!: string;

  @IsEnum(['ACCEPTED', 'DECLINED'])
  response!: 'ACCEPTED' | 'DECLINED';

  @IsOptional()
  @IsString()
  declineReason?: string;
}
