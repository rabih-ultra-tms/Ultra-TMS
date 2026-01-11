import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class Generate214Dto {
  @IsString()
  tradingPartnerId: string;

  @IsString()
  loadId: string;

  @IsString()
  statusCode: string;

  @IsOptional()
  @IsString()
  locationCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  sendImmediately?: boolean;
}
