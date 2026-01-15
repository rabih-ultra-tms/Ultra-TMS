import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FmcsaLookupDto {
  @ApiPropertyOptional({ description: 'DOT number' })
  @IsOptional()
  @IsString()
  dotNumber?: string;

  @ApiPropertyOptional({ description: 'MC number' })
  @IsOptional()
  @IsString()
  mcNumber?: string;

  @ApiPropertyOptional({ description: 'Validation placeholder', type: String })
  @ValidateIf((o) => !o.dotNumber && !o.mcNumber)
  @IsNotEmpty({ message: 'Either DOT or MC number is required' })
  placeholder?: never;
}
