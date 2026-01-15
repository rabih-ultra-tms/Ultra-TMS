import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({ description: 'Order identifier associated with the claim.' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ description: 'Load identifier associated with the claim.' })
  @IsOptional()
  @IsString()
  loadId?: string;

  @ApiPropertyOptional({ description: 'Company identifier for the claim.' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Carrier identifier for the claim.' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiProperty({ enum: ClaimType, description: 'Claim type classification.' })
  @IsEnum(ClaimType)
  claimType!: ClaimType;

  @ApiProperty({ description: 'Detailed claim description.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: 'Incident date in ISO 8601 format.' })
  @IsDateString()
  incidentDate!: string;

  @ApiPropertyOptional({ description: 'Incident location information.' })
  @IsOptional()
  @IsString()
  incidentLocation?: string;

  @ApiProperty({ minimum: 0, description: 'Claimed amount in currency units.' })
  @IsNumber()
  @Min(0)
  claimedAmount!: number;

  @ApiProperty({ description: 'Name of the claimant.' })
  @IsString()
  @IsNotEmpty()
  claimantName!: string;

  @ApiPropertyOptional({ description: 'Company name of the claimant.' })
  @IsOptional()
  @IsString()
  claimantCompany?: string;

  @ApiPropertyOptional({ description: 'Email address for the claimant.' })
  @IsOptional()
  @IsString()
  claimantEmail?: string;

  @ApiPropertyOptional({ description: 'Phone number for the claimant.' })
  @IsOptional()
  @IsString()
  claimantPhone?: string;

  @ApiPropertyOptional({ description: 'Date the claim was received (ISO 8601).' })
  @IsOptional()
  @IsDateString()
  receivedDate?: string;

  @ApiPropertyOptional({ description: 'Due date for claim resolution (ISO 8601).' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ type: [CreateClaimItemDto], description: 'Line items associated with the claim.' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClaimItemDto)
  items?: CreateClaimItemDto[];
}
