import { IsBoolean, IsOptional } from 'class-validator';

export class BolOptionsDto {
  @IsOptional()
  @IsBoolean()
  includeHazmat?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeSpecialInstructions?: boolean = true;
}
