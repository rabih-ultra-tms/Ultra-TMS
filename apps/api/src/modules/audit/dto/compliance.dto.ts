import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateComplianceCheckpointDto {
  @IsString()
  checkpointName!: string;

  @IsString()
  entityType!: string;

  @IsString()
  entityId!: string;

  @IsOptional()
  @IsString()
  requirement?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
