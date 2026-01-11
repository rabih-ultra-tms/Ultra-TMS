import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class FmcsaLookupDto {
  @IsOptional()
  @IsString()
  dotNumber?: string;

  @IsOptional()
  @IsString()
  mcNumber?: string;

  @ValidateIf((o) => !o.dotNumber && !o.mcNumber)
  @IsNotEmpty({ message: 'Either DOT or MC number is required' })
  placeholder?: never;
}
