import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class Generate990Dto {
  @IsString()
  tradingPartnerId: string;

  @IsString()
  loadId: string;

  @IsString()
  responseCode: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
