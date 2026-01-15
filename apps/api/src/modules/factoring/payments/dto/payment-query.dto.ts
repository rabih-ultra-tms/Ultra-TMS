import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FactoredPaymentStatus } from '../../dto/enums';

export class PaymentQueryDto {
  @ApiPropertyOptional({ description: 'Factoring company identifier to filter payments.' })
  @IsOptional()
  @IsString()
  factoringCompanyId?: string;

  @ApiPropertyOptional({ description: 'Settlement identifier to filter payments.' })
  @IsOptional()
  @IsString()
  settlementId?: string;

  @ApiPropertyOptional({ description: 'Carrier identifier to filter payments.' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ enum: FactoredPaymentStatus, description: 'Payment status to filter by.' })
  @IsOptional()
  @IsEnum(FactoredPaymentStatus)
  status?: FactoredPaymentStatus;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601) for payment date filtering.' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601) for payment date filtering.' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ minimum: 1, description: 'Results page number.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, description: 'Maximum results per page.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
