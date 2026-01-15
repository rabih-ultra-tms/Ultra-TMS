import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReleaseNoaDto {
  @ApiPropertyOptional({ description: 'Release reason' })
  @IsOptional()
  @IsString()
  releaseReason?: string;
}
