import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FactoringStatus } from '../../dto/enums';

export class UpdateCarrierFactoringStatusDto {
  @IsOptional()
  @IsEnum(FactoringStatus)
  factoringStatus?: FactoringStatus;

  @IsOptional()
  @IsString()
  factoringCompanyId?: string;

  @IsOptional()
  @IsString()
  activeNoaId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
