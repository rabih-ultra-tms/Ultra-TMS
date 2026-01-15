import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FactoringStatus } from '../../dto/enums';

export class UpdateCarrierFactoringStatusDto {
  @ApiPropertyOptional({ enum: FactoringStatus, description: 'Updated factoring status for the carrier.' })
  @IsOptional()
  @IsEnum(FactoringStatus)
  factoringStatus?: FactoringStatus;

  @ApiPropertyOptional({ description: 'Factoring company identifier linked to the carrier.' })
  @IsOptional()
  @IsString()
  factoringCompanyId?: string;

  @ApiPropertyOptional({ description: 'Active NOA record identifier for the carrier.' })
  @IsOptional()
  @IsString()
  activeNoaId?: string;

  @ApiPropertyOptional({ description: 'Notes about the factoring status update.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
