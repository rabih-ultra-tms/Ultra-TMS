import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateInvestigationDto {
  @ApiPropertyOptional({ description: 'Investigation notes for the claim.' })
  @IsOptional()
  @IsString()
  investigationNotes?: string;

  @ApiPropertyOptional({ description: 'Root cause identified for the claim.' })
  @IsOptional()
  @IsString()
  rootCause?: string;

  @ApiPropertyOptional({ description: 'Prevention notes or recommendations.' })
  @IsOptional()
  @IsString()
  preventionNotes?: string;
}
