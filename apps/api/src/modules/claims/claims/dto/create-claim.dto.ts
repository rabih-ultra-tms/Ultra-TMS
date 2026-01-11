import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ClaimType } from '@prisma/client';
import { CreateClaimItemDto } from '../../items/dto/create-claim-item.dto';

export class CreateClaimDto {
  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  loadId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsEnum(ClaimType)
  claimType!: ClaimType;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDateString()
  incidentDate!: string;

  @IsOptional()
  @IsString()
  incidentLocation?: string;

  @IsNumber()
  @Min(0)
  claimedAmount!: number;

  @IsString()
  @IsNotEmpty()
  claimantName!: string;

  @IsOptional()
  @IsString()
  claimantCompany?: string;

  @IsOptional()
  @IsString()
  claimantEmail?: string;

  @IsOptional()
  @IsString()
  claimantPhone?: string;

  @IsOptional()
  @IsDateString()
  receivedDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClaimItemDto)
  items?: CreateClaimItemDto[];
}
