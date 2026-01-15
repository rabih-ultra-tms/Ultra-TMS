import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class RateConfirmationOptionsDto {
  @IsOptional()
  @IsBoolean()
  includeAccessorials?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeTerms?: boolean = true;

  @IsOptional()
  @IsString()
  customMessage?: string;

  @IsOptional()
  @IsBoolean()
  sendToCarrier?: boolean = false;
}
